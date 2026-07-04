import { prisma } from "@/lib/prisma";

// A student shouldn't be left wondering whether anything is happening.
// 30 minutes unanswered → proactive "still working on it" notice; 1 hour
// unanswered → automatically escalate to second-opinion routing (the same
// flag the student can set manually at post time), so the synthesis step
// kicks in once multiple verified answers arrive.
const DELAY_NOTICE_AFTER_MS = 30 * 60 * 1000;
const AUTO_ESCALATE_AFTER_MS = 60 * 60 * 1000;

/**
 * One pass over unanswered questions. Designed to run every few minutes via
 * GET /api/cron/question-sweep; each action records a timestamp on the
 * question so re-running the sweep never double-sends. Questions answered
 * between sweeps drop out naturally (status is no longer OPEN).
 */
export async function sweepUnansweredQuestions(now: Date = new Date()) {
  const delayCutoff = new Date(now.getTime() - DELAY_NOTICE_AFTER_MS);
  const escalateCutoff = new Date(now.getTime() - AUTO_ESCALATE_AFTER_MS);

  const needingNotice = await prisma.question.findMany({
    where: { status: "OPEN", createdAt: { lte: delayCutoff }, delayNoticeSentAt: null },
    select: { id: true, authorId: true },
  });

  for (const q of needingNotice) {
    await prisma.$transaction([
      prisma.notification.create({
        data: { userId: q.authorId, type: "QUESTION_DELAY_NOTICE", questionId: q.id },
      }),
      prisma.question.update({ where: { id: q.id }, data: { delayNoticeSentAt: now } }),
    ]);
  }

  const needingEscalation = await prisma.question.findMany({
    where: { status: "OPEN", createdAt: { lte: escalateCutoff }, autoEscalatedAt: null },
    select: { id: true, authorId: true, secondOpinionRequested: true },
  });

  for (const q of needingEscalation) {
    await prisma.$transaction([
      prisma.question.update({
        where: { id: q.id },
        data: { secondOpinionRequested: true, autoEscalatedAt: now },
      }),
      prisma.notification.create({
        data: { userId: q.authorId, type: "QUESTION_ESCALATED", questionId: q.id },
      }),
    ]);
  }

  return {
    delayNoticesSent: needingNotice.length,
    escalated: needingEscalation.length,
  };
}
