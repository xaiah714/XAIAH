"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, requireVerifiedUser } from "@/lib/auth-helpers";
import { saveUploadedPhoto } from "@/lib/uploads";
import { notifyTutorsForSubject } from "@/lib/notify";

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
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let photoUrl: string | null = null;
  try {
    photoUrl = await saveUploadedPhoto(formData.get("photo") as File | null);
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
  body: z.string().min(1, "Write an answer before submitting"),
});

export type AnswerFormState = { error?: string };

export async function createAnswerAction(
  _prevState: AnswerFormState,
  formData: FormData
): Promise<AnswerFormState> {
  const user = await requireVerifiedUser();

  const parsed = answerSchema.safeParse({
    questionId: formData.get("questionId"),
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

  revalidatePath(`/questions/${parsed.data.questionId}`);
  revalidatePath("/tutor");
  return {};
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
