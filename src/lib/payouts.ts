import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * Weekly payout run: for every tutor with a ready Connect account, pays out
 * tip earnings received since their last payout. Tips are the only
 * per-transaction tutor earnings modeled so far — splitting subscription and
 * pay-per-session revenue across tutor hours worked is a real unit-economics
 * decision the business needs to make (see BUILD_PLAN.md "Unit economics").
 * Trigger via GET /api/cron/weekly-payouts on a weekly schedule (Vercel Cron,
 * GitHub Actions cron, etc.) — see BUILD_PLAN.md for wiring instructions.
 */
export async function runWeeklyPayouts() {
  const tutors = await prisma.user.findMany({
    where: { role: "TUTOR", stripeConnectReady: true, stripeConnectId: { not: null } },
  });

  const results: Array<{ tutorId: string; amountCents: number; status: string }> = [];

  for (const tutor of tutors) {
    const lastPayout = await prisma.payout.findFirst({
      where: { tutorId: tutor.id },
      orderBy: { periodEnd: "desc" },
    });

    const periodStart = lastPayout?.periodEnd ?? tutor.createdAt;
    const periodEnd = new Date();

    const tips = await prisma.tip.aggregate({
      where: { toId: tutor.id, createdAt: { gt: periodStart, lte: periodEnd } },
      _sum: { amountCents: true, platformCutCents: true },
    });

    const grossCents = tips._sum.amountCents ?? 0;
    const platformCutCents = tips._sum.platformCutCents ?? 0;
    const amountCents = grossCents - platformCutCents;

    if (amountCents <= 0) continue;

    const payout = await prisma.payout.create({
      data: { tutorId: tutor.id, periodStart, periodEnd, amountCents, status: "PENDING" },
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
