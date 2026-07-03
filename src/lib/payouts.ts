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
 * Weekly payout run. Trigger via GET /api/cron/weekly-payouts on a weekly
 * schedule (Vercel Cron, GitHub Actions cron, etc) — see BUILD_PLAN.md.
 *
 * Only tutors with a ready Stripe Connect account are paid. Their pool share
 * is computed against total subscription-funded minutes served by *other
 * ready tutors* in the same window, so a not-yet-connected tutor's minutes
 * don't shrink everyone else's share, but also means they should connect
 * payouts before a run to be included in that week's pool — see BUILD_PLAN.md
 * for this known limitation.
 */
export async function runWeeklyPayouts() {
  const lastRun = await prisma.payout.aggregate({ _max: { periodEnd: true } });
  const periodStart = lastRun._max.periodEnd ?? new Date(Date.now() - DEFAULT_LOOKBACK_MS);
  const periodEnd = new Date();

  const tutors = await prisma.user.findMany({
    where: { role: "TUTOR", stripeConnectReady: true, stripeConnectId: { not: null } },
  });

  const poolInvoices = await prisma.subscriptionInvoice.aggregate({
    where: { createdAt: { gt: periodStart, lte: periodEnd } },
    _sum: { amountCents: true },
  });
  const totalPoolCents = Math.round((poolInvoices._sum.amountCents ?? 0) * SUBSCRIPTION_POOL_SHARE);

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

    const payout = await prisma.payout.create({
      data: {
        tutorId: tutor.id,
        periodStart,
        periodEnd,
        amountCents,
        poolCents,
        directCents,
        tipCents,
        status: "PENDING",
      },
    });

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

  return results;
}
