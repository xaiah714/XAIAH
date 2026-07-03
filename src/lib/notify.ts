import { prisma } from "@/lib/prisma";
import type { NotificationType, Subject } from "@/generated/prisma/client";

/**
 * Broadcasts an in-app notification to every currently-available, active
 * tutor tagged for a subject — the spec's "no direct tutor-to-student
 * contact" routing model. Tutors claim from their own queue; nothing here
 * ever hands out a student's contact info, and there's no persistent
 * tutor<->student channel outside of a claimed, session-scoped thread.
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

  await prisma.notification.createMany({
    data: tutors.map((t) => ({
      userId: t.id,
      type: event.type,
      subject,
      questionId: event.questionId,
      chatSessionId: event.chatSessionId,
    })),
  });
}
