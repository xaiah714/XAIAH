import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * Payout split, per spec: subscription revenue is pooled (not tied to one
 * subscriber) and split 50/50 between platform and tutor pool, distributed
 * proportional to subscription-funded live-chat minutes served. Pay-per-session
 * pays 75% direct to the tutor who handled it (less pooled risk, so a bigger
 * cut). Tips pass through in full by default (platformCutCents is 0 unless
 * changed). Rough math from the spec: ~$7.50/mo avg subscription * 50% =
 * $3.75/subscriber/mo to the pool; at ~30 min/mo average usage that's about
 * $7.50/hr effective tutor pay — track actual usage against this and revisit
 * the split if usage runs well above that (the goal, since it's the value
 * prop over Chegg).
 */
const SUBSCRIPTION_POOL_SHARE = 0.5;
const PAY_PER_SESSION_TUTOR_SHARE = 0.75;
const DEFAULT_LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * A tutor without a ready Connect account still earns their share — it's
 * held rather than dropped. Held funds expire after 30 days if they still
 * haven't connected payouts (avoids indefinite holds turning into an
 * escrow-law/accounting problem), with a reminder before the deadline so
 * it's never a silent forfeiture. Expired amounts roll back into the next
 * run's pool rather than becoming platform breakage.
 */
const HOLD_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const REMINDER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Weekly payout run. In deployment, scripts/cron-worker.ts calls this on
 * Mondays 12:00 UTC; GET /api/cron/weekly-payouts triggers it manually.
 */
export async function runWeeklyPayouts() {
  const lastRun = await prisma.payout.aggregate({ _max: { periodEnd: true } });
  const periodStart = lastRun._max.periodEnd ?? new Date(Date.now() - DEFAULT_LOOKBACK_MS);
  const now = new Date();
  const periodEnd = now;

  const carryoverCents = await expireStaleHeldPayouts(now);
  await sendExpiryReminders(now);

  const tutors = await prisma.user.findMany({ where: { role: "TUTOR" } });

  const poolInvoices = await prisma.subscriptionInvoice.aggregate({
    where: { createdAt: { gt: periodStart, lte: periodEnd } },
    _sum: { amountCents: true },
  });
  const totalPoolCents =
    Math.round((poolInvoices._sum.amountCents ?? 0) * SUBSCRIPTION_POOL_SHARE) + carryoverCents;

  const minutesByTutor = new Map<string, number>();
  let totalMinutes = 0;
  for (const tutor of tutors) {
    const sessions = await prisma.chatSession.findMany({
      where: {
        tutorId: tutor.id,
        status: "ENDED",
        paymentId: null, // null paymentId = subscription-funded, not pay-per-session
        endedAt: { gt: periodStart, lte: periodEnd },
        matchedAt: { not: null },
      },
      select: { matchedAt: true, endedAt: true },
    });
    const minutes = sessions.reduce(
      (sum, s) => sum + (s.endedAt!.getTime() - s.matchedAt!.getTime()) / 60000,
      0
    );
    minutesByTutor.set(tutor.id, minutes);
    totalMinutes += minutes;
  }

  const results: Array<{ tutorId: string; amountCents: number; status: string }> = [];

  for (const tutor of tutors) {
    const minutes = minutesByTutor.get(tutor.id) ?? 0;
    const poolCents =
      totalMinutes > 0 ? Math.round((totalPoolCents * minutes) / totalMinutes) : 0;

    const paidSessions = await prisma.chatSession.findMany({
      where: {
        tutorId: tutor.id,
        status: "ENDED",
        endedAt: { gt: periodStart, lte: periodEnd },
        payment: { type: "PAY_PER_SESSION" },
      },
      include: { payment: true },
    });
    const directGrossCents = paidSessions.reduce((sum, s) => sum + (s.payment?.amountCents ?? 0), 0);
    const directCents = Math.round(directGrossCents * PAY_PER_SESSION_TUTOR_SHARE);

    const tips = await prisma.tip.aggregate({
      where: { toId: tutor.id, createdAt: { gt: periodStart, lte: periodEnd } },
      _sum: { amountCents: true, platformCutCents: true },
    });
    const tipCents = (tips._sum.amountCents ?? 0) - (tips._sum.platformCutCents ?? 0);

    const amountCents = poolCents + directCents + tipCents;
    if (amountCents <= 0) continue;

    const ready = tutor.stripeConnectReady && Boolean(tutor.stripeConnectId);

    const payout = await prisma.payout.create({
      data: {
        tutorId: tutor.id,
        periodStart,
        periodEnd,
        amountCents,
        poolCents,
        directCents,
        tipCents,
        status: ready ? "PENDING" : "HELD",
        holdExpiresAt: ready ? undefined : new Date(now.getTime() + HOLD_DURATION_MS),
      },
    });

    if (!ready) {
      await prisma.notification.create({
        data: { userId: tutor.id, type: "PAYOUT_HELD", payoutId: payout.id },
      });
      results.push({ tutorId: tutor.id, amountCents, status: "HELD" });
      continue;
    }

    try {
      const transfer = await stripe.transfers.create({
        amount: amountCents,
        currency: "usd",
        destination: tutor.stripeConnectId as string,
        transfer_group: payout.id,
      });

      await prisma.payout.update({
        where: { id: payout.id },
        data: { status: "PAID", paidAt: new Date(), stripeTransferId: transfer.id },
      });
      results.push({ tutorId: tutor.id, amountCents, status: "PAID" });
    } catch (err) {
      await prisma.payout.update({ where: { id: payout.id }, data: { status: "FAILED" } });
      results.push({
        tutorId: tutor.id,
        amountCents,
        status: `FAILED: ${err instanceof Error ? err.message : "unknown"}`,
      });
    }
  }

  // Safety net in case a Connect-ready webhook didn't fire for some reason —
  // don't leave payable funds sitting in HELD indefinitely.
  for (const tutor of tutors) {
    if (tutor.stripeConnectReady && tutor.stripeConnectId) {
      await releaseHeldPayoutsForTutor(tutor.id);
    }
  }

  return results;
}

/** Marks HELD payouts past their hold deadline as EXPIRED, returns the total to fold back into the pool. */
async function expireStaleHeldPayouts(now: Date): Promise<number> {
  const stale = await prisma.payout.findMany({
    where: { status: "HELD", holdExpiresAt: { lte: now } },
  });
  if (stale.length === 0) return 0;

  let total = 0;
  for (const payout of stale) {
    total += payout.amountCents;
    await prisma.$transaction([
      prisma.payout.update({
        where: { id: payout.id },
        data: { status: "EXPIRED", expiredAt: now },
      }),
      prisma.notification.create({
        data: { userId: payout.tutorId, type: "PAYOUT_EXPIRED", payoutId: payout.id },
      }),
    ]);
  }
  return total;
}

/** Sends a one-time reminder for HELD payouts expiring within the reminder window. */
async function sendExpiryReminders(now: Date) {
  const soon = new Date(now.getTime() + REMINDER_WINDOW_MS);
  const dueForReminder = await prisma.payout.findMany({
    where: {
      status: "HELD",
      holdExpiresAt: { lte: soon, gt: now },
      reminderSentAt: null,
    },
  });

  for (const payout of dueForReminder) {
    await prisma.$transaction([
      prisma.payout.update({ where: { id: payout.id }, data: { reminderSentAt: now } }),
      prisma.notification.create({
        data: { userId: payout.tutorId, type: "PAYOUT_REMINDER", payoutId: payout.id },
      }),
    ]);
  }
}

/**
 * Pays out any non-expired HELD payouts for a tutor — called right when
 * their Connect account becomes ready (see the account.updated webhook) so
 * held earnings land as soon as onboarding finishes, not on the next
 * scheduled run.
 */
export async function releaseHeldPayoutsForTutor(tutorId: string) {
  const tutor = await prisma.user.findUnique({ where: { id: tutorId } });
  if (!tutor?.stripeConnectReady || !tutor.stripeConnectId) return;

  const held = await prisma.payout.findMany({ where: { tutorId, status: "HELD" } });

  for (const payout of held) {
    try {
      const transfer = await stripe.transfers.create({
        amount: payout.amountCents,
        currency: "usd",
        destination: tutor.stripeConnectId,
        transfer_group: payout.id,
      });

      await prisma.$transaction([
        prisma.payout.update({
          where: { id: payout.id },
          data: { status: "PAID", paidAt: new Date(), stripeTransferId: transfer.id },
        }),
        prisma.notification.create({
          data: { userId: tutorId, type: "PAYOUT_RELEASED", payoutId: payout.id },
        }),
      ]);
    } catch {
      // Leave it HELD — retried on the next release trigger or weekly run,
      // still bounded by its original holdExpiresAt.
    }
  }
}
