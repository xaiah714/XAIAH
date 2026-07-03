"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { findAvailableTutor } from "@/lib/matching";

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

export type StartChatState = { error?: string };

const startChatSchema = z.object({ subject: z.enum(SUBJECT_VALUES) });

/**
 * Live chat always requires an active subscription or a per-session payment
 * (never blocked outright — community Q&A is the always-free tier). If the
 * student isn't entitled, we send them to pick a payment path instead of
 * failing silently.
 */
export async function startChatSessionAction(
  _prevState: StartChatState,
  formData: FormData
): Promise<StartChatState> {
  const user = await requireUser();

  const parsed = startChatSchema.safeParse({ subject: formData.get("subject") });
  if (!parsed.success) {
    return { error: "Pick a subject" };
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const entitled = subscription?.status === "ACTIVE";

  if (!entitled) {
    redirect(`/chat/new/pay?subject=${parsed.data.subject}`);
  }

  const tutor = await findAvailableTutor(parsed.data.subject);

  const session = await prisma.chatSession.create({
    data: {
      studentId: user.id,
      subject: parsed.data.subject,
      status: tutor ? "ACTIVE" : "WAITING",
      tutorId: tutor?.id,
      matchedAt: tutor ? new Date() : undefined,
    },
  });

  redirect(`/chat/${session.id}`);
}

export async function claimChatSessionAction(chatSessionId: string) {
  const user = await requireUser();
  if (user.role !== "TUTOR") throw new Error("Only tutors can claim sessions");

  const session = await prisma.chatSession.findUnique({ where: { id: chatSessionId } });
  if (!session || session.status !== "WAITING" || session.tutorId) {
    throw new Error("This session is no longer available");
  }

  await prisma.chatSession.update({
    where: { id: chatSessionId },
    data: { tutorId: user.id, status: "ACTIVE", matchedAt: new Date() },
  });

  revalidatePath("/chat");
  redirect(`/chat/${chatSessionId}`);
}

const sendMessageSchema = z.object({
  chatSessionId: z.string().min(1),
  body: z.string().min(1).max(4000),
});

export async function sendMessageAction(formData: FormData) {
  const user = await requireUser();
  const parsed = sendMessageSchema.safeParse({
    chatSessionId: formData.get("chatSessionId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return;

  const session = await prisma.chatSession.findUnique({ where: { id: parsed.data.chatSessionId } });
  if (!session || session.status !== "ACTIVE") return;
  if (session.studentId !== user.id && session.tutorId !== user.id) return;

  await prisma.message.create({
    data: {
      chatSessionId: parsed.data.chatSessionId,
      senderId: user.id,
      body: parsed.data.body,
    },
  });

  revalidatePath(`/chat/${parsed.data.chatSessionId}`);
}

export async function endChatSessionAction(chatSessionId: string) {
  const user = await requireUser();
  const session = await prisma.chatSession.findUnique({ where: { id: chatSessionId } });
  if (!session) return;
  if (session.studentId !== user.id && session.tutorId !== user.id) return;

  await prisma.chatSession.update({
    where: { id: chatSessionId },
    data: { status: "ENDED", endedAt: new Date() },
  });

  revalidatePath(`/chat/${chatSessionId}`);
  revalidatePath("/chat");
}
