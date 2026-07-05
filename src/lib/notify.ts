import { prisma } from "@/lib/prisma";
import type { NotificationType, Subject } from "@/generated/prisma/client";
import { getSuppressedTutorIds } from "@/lib/tutor-standing";
import { sendDisputeReviewEmail, sendAdminDisputeAlert } from "@/lib/email";
import { subjectLabel } from "@/lib/subjects";

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

/**
 * Dispute broadcast: a verified tutor disagreed with the existing verified
 * answer(s) on a question. Every ACTIVE tutor tagged in the subject gets an
 * in-app notification AND an email — regardless of their availability
 * toggle or standing, because dispute review wants the whole subject pool's
 * eyes. The tutor who raised the disagreement is excluded (they know).
 * The platform owner gets a separate informational alert.
 */
export async function notifyDisputeReview(
  question: { id: string; title: string; subject: Subject },
  raisedByTutorId: string
) {
  const tutors = await prisma.user.findMany({
    where: {
      role: "TUTOR",
      tutorStatus: "ACTIVE",
      tutorSubjects: { has: question.subject },
      id: { not: raisedByTutorId },
    },
    select: { id: true, email: true },
  });

  if (tutors.length > 0) {
    await prisma.notification.createMany({
      data: tutors.map((t) => ({
        userId: t.id,
        type: "DISPUTE_REVIEW" as NotificationType,
        subject: question.subject,
        questionId: question.id,
      })),
    });
    await Promise.allSettled(
      tutors.map((t) =>
        sendDisputeReviewEmail(t.email, subjectLabel(question.subject), question.title, question.id)
      )
    );
  }

  await sendAdminDisputeAlert(subjectLabel(question.subject), question.title, question.id);
}

// New-student signup notifications currently go out instantly per signup
// (volume is low pre-launch). To switch to a daily digest later: change this
// to "daily-digest" and have a daily cron aggregate the day's signups per
// subject instead — Notification rows carry createdAt + subject, and this
// function is the only place delivery happens, so nothing else changes.
const NEW_STUDENT_NOTIFY_MODE: "instant" | "daily-digest" = "instant";

/**
 * Tells subject-tagged tutors a new student in their lane joined. A tutor
 * tagged in several of the student's subjects gets one notification (first
 * matching subject), not one per subject.
 */
export async function notifyTutorsOfNewStudent(studentSubjects: Subject[]) {
  if (studentSubjects.length === 0) return;
  if (NEW_STUDENT_NOTIFY_MODE !== "instant") return; // digest cron takes over in digest mode

  const tutors = await prisma.user.findMany({
    where: {
      role: "TUTOR",
      tutorStatus: "ACTIVE",
      tutorSubjects: { hasSome: studentSubjects },
    },
    select: { id: true, tutorSubjects: true },
  });
  if (tutors.length === 0) return;

  await prisma.notification.createMany({
    data: tutors.map((t) => ({
      userId: t.id,
      type: "NEW_STUDENT_SIGNUP" as NotificationType,
      subject: studentSubjects.find((s) => t.tutorSubjects.includes(s)) ?? studentSubjects[0],
    })),
  });
}
