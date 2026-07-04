import { prisma } from "@/lib/prisma";
import type { NotificationType, Subject } from "@/generated/prisma/client";
import { getSuppressedTutorIds } from "@/lib/tutor-standing";

/**
 * Broadcasts an in-app notification to every currently-available, active
 * tutor tagged for a subject — the spec's "no direct tutor-to-student
 * contact" routing model. Tutors claim from their own queue; nothing here
 * ever hands out a student's contact info, and there's no persistent
 * tutor<->student channel outside of a claimed, session-scoped thread.
 *
 * Tutors with a high ratio of flagged (incomplete/incorrect) verified
 * answers are excluded from the broadcast — repeatedly low-quality answers
 * reduce how much new work a tutor is routed, not just their star rating.
 */
export async function notifyTutorsForSubject(
  subject: Subject,
  event: { type: NotificationType; questionId?: string; chatSessionId?: string }
) {
  const tutors = await prisma.user.findMany({
    where: {
      role: "TUTOR",
      tutorStatus: "ACTIVE",
      tutorAvailable: true,
      tutorSubjects: { has: subject },
    },
    select: { id: true },
  });

  if (tutors.length === 0) return;

  const suppressed = await getSuppressedTutorIds(tutors.map((t) => t.id));
  const eligibleTutors = tutors.filter((t) => !suppressed.has(t.id));
  if (eligibleTutors.length === 0) return;

  await prisma.notification.createMany({
    data: eligibleTutors.map((t) => ({
      userId: t.id,
      type: event.type,
      subject,
      questionId: event.questionId,
      chatSessionId: event.chatSessionId,
    })),
  });
}
