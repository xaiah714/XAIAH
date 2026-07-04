"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, requireVerifiedUser } from "@/lib/auth-helpers";
import { saveUploadedPhoto } from "@/lib/uploads";
import { notifyTutorsForSubject } from "@/lib/notify";
import { synthesizeVerifiedAnswers } from "@/lib/ai";

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
  reasoning: z.string().min(1, "Show your reasoning/steps before the final answer"),
  body: z.string().min(1, "Write a final answer before submitting"),
});

export type AnswerFormState = { error?: string };

export async function createAnswerAction(
  _prevState: AnswerFormState,
  formData: FormData
): Promise<AnswerFormState> {
  const user = await requireVerifiedUser();

  const parsed = answerSchema.safeParse({
    questionId: formData.get("questionId"),
    reasoning: formData.get("reasoning"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.$transaction([
    prisma.answer.create({
      data: {
        questionId: parsed.data.questionId,
        authorId: user.id,
        reasoning: parsed.data.reasoning,
        body: parsed.data.body,
        isVerifiedTutorAnswer: user.role === "TUTOR",
      },
    }),
    prisma.question.update({
      where: { id: parsed.data.questionId },
      data: { status: "ANSWERED" },
    }),
    prisma.notification.updateMany({
      where: { questionId: parsed.data.questionId, userId: user.id, read: false },
      data: { read: true },
    }),
  ]);

  await maybeSynthesizeSecondOpinion(parsed.data.questionId);

  revalidatePath(`/questions/${parsed.data.questionId}`);
  revalidatePath("/tutor");
  return {};
}

/**
 * Once a question flagged for a second opinion has 2+ independent verified-
 * tutor answers and no cached synthesis yet, ask the AI layer to reconcile
 * them into one simplified explanation. Synthesis only ever reformats
 * reasoning tutors already verified — see src/lib/ai.ts.
 */
async function maybeSynthesizeSecondOpinion(questionId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, title: true, body: true, secondOpinionRequested: true, aiSynthesis: true },
  });
  if (!question || !question.secondOpinionRequested || question.aiSynthesis) return;

  const verifiedAnswers = await prisma.answer.findMany({
    where: { questionId, isVerifiedTutorAnswer: true },
    select: { reasoning: true, body: true, author: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  if (verifiedAnswers.length < 2) return;

  const synthesis = await synthesizeVerifiedAnswers(
    question.title,
    question.body,
    verifiedAnswers.map((a) => ({ tutorName: a.author.name, reasoning: a.reasoning, body: a.body }))
  );
  if (!synthesis) return;

  await prisma.question.update({
    where: { id: questionId },
    data: { aiSynthesis: synthesis, aiSynthesizedAt: new Date() },
  });
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
