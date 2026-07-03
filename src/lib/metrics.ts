import { prisma } from "@/lib/prisma";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function average(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function formatMinutes(ms: number) {
  const minutes = ms / 60000;
  if (minutes < 60) return `${minutes.toFixed(1)} min`;
  return `${(minutes / 60).toFixed(1)} hr`;
}

export async function getAdminMetrics() {
  const since = new Date(Date.now() - THIRTY_DAYS_MS);

  const [
    answeredQuestions,
    totalQuestions,
    resolvedQuestions,
    matchedSessions,
    tutors,
    activeSubscribers,
    canceledThisPeriod,
    subscribersAtStart,
    tips,
    tutorQueueCounts,
  ] = await Promise.all([
    prisma.question.findMany({
      where: { createdAt: { gte: since }, answers: { some: {} } },
      select: { id: true, createdAt: true, answers: { orderBy: { createdAt: "asc" }, take: 1 } },
    }),
    prisma.question.count({ where: { createdAt: { gte: since } } }),
    prisma.question.count({ where: { createdAt: { gte: since }, status: "RESOLVED" } }),
    prisma.chatSession.findMany({
      where: { requestedAt: { gte: since }, matchedAt: { not: null } },
      select: { requestedAt: true, matchedAt: true, tutorId: true },
    }),
    prisma.user.findMany({
      where: { role: "TUTOR" },
      select: { id: true, timezone: true, tutorStatus: true },
    }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.findMany({
      where: { canceledAt: { gte: since } },
      select: { cancelReason: true },
    }),
    prisma.subscription.count({ where: { createdAt: { lt: since } } }),
    prisma.tip.findMany({ where: { createdAt: { gte: since } }, select: { amountCents: true } }),
    prisma.chatSession.groupBy({
      by: ["tutorId"],
      where: { requestedAt: { gte: since }, tutorId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const responseTimesMs = answeredQuestions
    .filter((q) => q.answers[0])
    .map((q) => q.answers[0].createdAt.getTime() - q.createdAt.getTime());

  const connectTimesMs = matchedSessions
    .filter((s) => s.matchedAt)
    .map((s) => s.matchedAt!.getTime() - s.requestedAt.getTime());

  const utilizationByTimezone = new Map<string, { tutors: number; sessions: number }>();
  for (const t of tutors) {
    const entry = utilizationByTimezone.get(t.timezone) ?? { tutors: 0, sessions: 0 };
    entry.tutors += 1;
    utilizationByTimezone.set(t.timezone, entry);
  }
  const sessionsByTutor = new Map(tutorQueueCounts.map((r) => [r.tutorId, r._count._all]));
  for (const t of tutors) {
    const entry = utilizationByTimezone.get(t.timezone)!;
    entry.sessions += sessionsByTutor.get(t.id) ?? 0;
  }

  const chatSessionsPerSubscriberRows = await prisma.chatSession.groupBy({
    by: ["studentId"],
    where: { requestedAt: { gte: since } },
    _count: { _all: true },
  });
  const avgSessionsPerSubscriber = average(chatSessionsPerSubscriberRows.map((r) => r._count._all));

  // Effective $/hr the subscription tutor pool works out to — the spec's
  // core unit-economics check ("~$7.50/hr in range; usage above that needs
  // the split or pricing revisited").
  const [poolRevenue, subscriptionFundedSessions] = await Promise.all([
    prisma.subscriptionInvoice.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { amountCents: true },
    }),
    prisma.chatSession.findMany({
      where: {
        status: "ENDED",
        paymentId: null,
        endedAt: { gte: since },
        matchedAt: { not: null },
      },
      select: { matchedAt: true, endedAt: true },
    }),
  ]);
  const poolCentsThisPeriod = (poolRevenue._sum.amountCents ?? 0) * 0.5;
  const subscriptionMinutesThisPeriod = subscriptionFundedSessions.reduce(
    (sum, s) => sum + (s.endedAt!.getTime() - s.matchedAt!.getTime()) / 60000,
    0
  );
  const effectiveTutorPayPerHour =
    subscriptionMinutesThisPeriod > 0
      ? poolCentsThisPeriod / (subscriptionMinutesThisPeriod / 60) / 100
      : 0;

  const churnRate =
    subscribersAtStart > 0 ? (canceledThisPeriod.length / subscribersAtStart) * 100 : 0;

  const tipTotalCents = tips.reduce((sum, t) => sum + t.amountCents, 0);

  return {
    avgAsyncResponseTime: formatMinutes(average(responseTimesMs)),
    avgLiveConnectTime: formatMinutes(average(connectTimesMs)),
    resolutionRatePct: totalQuestions > 0 ? (resolvedQuestions / totalQuestions) * 100 : 0,
    totalQuestions,
    utilizationByTimezone: Array.from(utilizationByTimezone.entries()).map(([timezone, v]) => ({
      timezone,
      ...v,
    })),
    activeSubscribers,
    avgSessionsPerSubscriber,
    effectiveTutorPayPerHour,
    churnRatePct: churnRate,
    cancelReasons: canceledThisPeriod
      .map((c) => c.cancelReason)
      .filter((r): r is string => Boolean(r)),
    tipVolumeCents: tipTotalCents,
    tipCount: tips.length,
    avgTipCents: tips.length > 0 ? tipTotalCents / tips.length : 0,
    tutorStatusCounts: tutors.reduce<Record<string, number>>((acc, t) => {
      const key = t.tutorStatus ?? "UNKNOWN";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  };
}
