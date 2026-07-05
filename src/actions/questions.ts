"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, requireVerifiedUser } from "@/lib/auth-helpers";
import { saveUploadedPhoto } from "@/lib/uploads";
import { notifyTutorsForSubject, notifyDisputeReview } from "@/lib/notify";
import { checkDisputeResolution } from "@/lib/consensus";

const SUBJECT_VALUES = [
  "MATH",
  "PHYSICS",
  "CHEMISTRY",
  "BIOLOGY",
  "COMPUTER_SCIENCE",
  "PSYCHOLOGY",
  "PHILOSOPHY",
  "NURSING",
  "OTHER",
] as const;

const questionSchema = z
  .object({
    subject: z.enum(SUBJECT_VALUES),
    title: z.string().min(4, "Give it a short title").max(200),
    body: z.string().min(1, "Describe what you're stuck on"),
    subjectOther: z.string().max(100).optional(),
    methodNotes: z.string().max(2000).optional(),
    textbookName: z.string().max(200).optional(),
    textbookEdition: z.string().max(50).optional(),
    courseName: z.string().max(200).optional(),
    secondOpinionRequested: z.boolean().optional(),
  })
  .refine((data) => data.subject !== "OTHER" || (data.subjectOther?.trim().length ?? 0) > 0, {
    message: "Tell us what subject this is",
    path: ["subjectOther"],
  });

export type QuestionFormState = { error?: string };

export async function createQuestionAction(
  _prevState: QuestionFormState,
  formData: FormData
): Promise<QuestionFormState> {
  const user = await requireVerifiedUser();

  const parsed = questionSchema.safeParse({
    subject: formData.get("subject"),
    title: formData.get("title"),
    body: formData.get("body"),
    subjectOther: formData.get("subjectOther") || undefined,
    methodNotes: formData.get("methodNotes") || undefined,
    textbookName: formData.get("textbookName") || undefined,
    textbookEdition: formData.get("textbookEdition") || undefined,
    courseName: formData.get("courseName") || undefined,
    secondOpinionRequested: formData.get("secondOpinionRequested") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let photoUrl: string | null = null;
  let methodPhotoUrl: string | null = null;
  try {
    photoUrl = await saveUploadedPhoto(formData.get("photo") as File | null);
    methodPhotoUrl = await saveUploadedPhoto(formData.get("methodPhoto") as File | null);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed" };
  }

  const question = await prisma.question.create({
    data: {
      authorId: user.id,
      subject: parsed.data.subject,
      title: parsed.data.title,
      body: parsed.data.body,
      photoUrls: photoUrl ? [photoUrl] : [],
      methodNotes: parsed.data.methodNotes,
      methodPhotoUrl,
      textbookName: parsed.data.textbookName,
      textbookEdition: parsed.data.textbookEdition,
      courseName: parsed.data.courseName,
      secondOpinionRequested: parsed.data.secondOpinionRequested ?? false,
    },
  });

  if (parsed.data.subject === "OTHER" && parsed.data.subjectOther) {
    await prisma.subjectRequest.create({
      data: {
        requesterEmail: user.email ?? "unknown",
        subjectName: parsed.data.subjectOther,
        notes: `From question: ${question.id}`,
      },
    });
  }

  await notifyTutorsForSubject(parsed.data.subject, {
    type: "NEW_QUESTION",
    questionId: question.id,
  });

  revalidatePath("/questions");
  redirect(`/questions/${question.id}`);
}

const answerSchema = z.object({
  questionId: z.string().min(1),
  steps: z
    .array(z.string().trim())
    .transform((arr) => arr.filter((s) => s.length > 0))
    .pipe(z.array(z.string().max(4000)).min(1, "Show at least one solution step")),
  body: z.string().min(1, "Write a final answer before submitting"),
  stance: z.enum(["agree", "disagree"]).optional(),
});

export type AnswerFormState = { error?: string };

export async function createAnswerAction(
  _prevState: AnswerFormState,
  formData: FormData
): Promise<AnswerFormState> {
  const user = await requireVerifiedUser();

  const parsed = answerSchema.safeParse({
    questionId: formData.get("questionId"),
    steps: formData.getAll("steps").map(String),
    body: formData.get("body"),
    stance: formData.get("stance") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const question = await prisma.question.findUnique({
    where: { id: parsed.data.questionId },
    select: {
      id: true,
      title: true,
      subject: true,
      disputedAt: true,
      disputeResolvedAt: true,
      answers: {
        where: { isVerifiedTutorAnswer: true },
        select: { authorId: true },
      },
    },
  });
  if (!question) return { error: "Question not found" };

  // A verified tutor answering after other verified tutor(s) must declare a
  // stance — unless a dispute is already open, in which case the new answer
  // just backs itself (endorsements are the weigh-in mechanism).
  const isTutor = user.role === "TUTOR";
  const hasPriorVerified = question.answers.some((a) => a.authorId !== user.id);
  const disputeOpen = Boolean(question.disputedAt && !question.disputeResolvedAt);
  let agreesWithPrior: boolean | null = null;
  if (isTutor && hasPriorVerified && !disputeOpen) {
    if (!parsed.data.stance) {
      return {
        error:
          "This question already has a verified answer — say whether yours agrees or disagrees with it.",
      };
    }
    agreesWithPrior = parsed.data.stance === "agree";
  }

  const opensDispute = agreesWithPrior === false && !question.disputedAt;

  await prisma.$transaction([
    prisma.answer.create({
      data: {
        questionId: question.id,
        authorId: user.id,
        steps: parsed.data.steps,
        // reasoning mirrors the joined steps for search and older readers
        reasoning: parsed.data.steps
          .map((s, i) => `Step ${i + 1}: ${s}`)
          .join("\n\n"),
        body: parsed.data.body,
        isVerifiedTutorAnswer: isTutor,
        agreesWithPrior,
      },
    }),
    prisma.question.update({
      where: { id: question.id },
      data: { status: "ANSWERED", ...(opensDispute ? { disputedAt: new Date() } : {}) },
    }),
    prisma.notification.updateMany({
      where: { questionId: question.id, userId: user.id, read: false },
      data: { read: true },
    }),
  ]);

  if (opensDispute) {
    await notifyDisputeReview(
      { id: question.id, title: question.title, subject: question.subject },
      user.id
    );
  }

  revalidatePath(`/questions/${question.id}`);
  revalidatePath("/tutor");
  return {};
}

export type EndorseFormState = { error?: string };

/**
 * A verified tutor backing another tutor's answer ("I reviewed this and it's
 * correct"). Counts toward the "Verified by N tutors" badge, and on disputed
 * questions it's the weigh-in that builds consensus.
 */
export async function endorseAnswerAction(
  _prevState: EndorseFormState,
  formData: FormData
): Promise<EndorseFormState> {
  const user = await requireVerifiedUser();
  if (user.role !== "TUTOR") return { error: "Only verified tutors can endorse answers" };

  const answerId = String(formData.get("answerId") ?? "");
  if (!answerId) return { error: "Invalid answer" };

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    select: { id: true, questionId: true, authorId: true, isVerifiedTutorAnswer: true },
  });
  if (!answer || !answer.isVerifiedTutorAnswer) return { error: "Answer not found" };
  if (answer.authorId === user.id) return { error: "You already back your own answer" };

  await prisma.answerEndorsement.upsert({
    where: { answerId_tutorId: { answerId, tutorId: user.id } },
    create: { answerId, tutorId: user.id },
    update: {},
  });

  await checkDisputeResolution(answer.questionId);

  revalidatePath(`/questions/${answer.questionId}`);
  return {};
}

const flagAnswerSchema = z.object({
  answerId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export type FlagAnswerFormState = { error?: string; success?: boolean };

export async function flagAnswerAction(
  _prevState: FlagAnswerFormState,
  formData: FormData
): Promise<FlagAnswerFormState> {
  const user = await requireVerifiedUser();

  const parsed = flagAnswerSchema.safeParse({
    answerId: formData.get("answerId"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const answer = await prisma.answer.findUnique({
    where: { id: parsed.data.answerId },
    select: { questionId: true, authorId: true },
  });
  if (!answer) return { error: "Answer not found" };
  if (answer.authorId === user.id) return { error: "You can't flag your own answer" };

  await prisma.answerFlag.upsert({
    where: { answerId_flaggedById: { answerId: parsed.data.answerId, flaggedById: user.id } },
    create: { answerId: parsed.data.answerId, flaggedById: user.id, reason: parsed.data.reason },
    update: { reason: parsed.data.reason },
  });

  revalidatePath(`/questions/${answer.questionId}`);
  return { success: true };
}

export async function markQuestionResolvedAction(questionId: string) {
  const user = await requireUser();

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question || question.authorId !== user.id) {
    throw new Error("Not authorized to resolve this question");
  }

  await prisma.question.update({
    where: { id: questionId },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });

  revalidatePath(`/questions/${questionId}`);
  revalidatePath("/questions");
}
