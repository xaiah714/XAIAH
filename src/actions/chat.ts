"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireVerifiedUser } from "@/lib/auth-helpers";
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

export type StartChatState = { error?: string };

const startChatSchema = z.object({ subject: z.enum(SUBJECT_VALUES) });

/**
 * Live chat always requires an active subscription or a per-session payment
 * (never blocked outright — community Q&A is the always-free tier). If the
 * student isn't entitled, we send them to pick a payment path instead of
 * failing silently.
 *
 * Requests are never silently auto-assigned to a tutor. Every available,
 * subject-tagged tutor gets notified and claims the request themselves —
 * that's the spec's "no direct tutor-to-student contact" routing model:
 * students always initiate, tutors always choose to accept.
 */
export async function startChatSessionAction(
  _prevState: StartChatState,
  formData: FormData
): Promise<StartChatState> {
  const user = await requireVerifiedUser();

  const parsed = startChatSchema.safeParse({ subject: formData.get("subject") });
  if (!parsed.success) {
    return { error: "Pick a subject" };
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const entitled = subscription?.status === "ACTIVE";

  if (!entitled) {
    redirect(`/chat/new/pay?subject=${parsed.data.subject}`);
  }

  const session = await prisma.chatSession.create({
    data: { studentId: user.id, subject: parsed.data.subject, status: "WAITING" },
  });

  await notifyTutorsForSubject(parsed.data.subject, {
    type: "NEW_CHAT_REQUEST",
    chatSessionId: session.id,
  });

  redirect(`/chat/${session.id}`);
}

export async function claimChatSessionAction(chatSessionId: string) {
  const user = await requireVerifiedUser();
  if (user.role !== "TUTOR") throw new Error("Only tutors can claim sessions");

  const session = await prisma.chatSession.findUnique({ where: { id: chatSessionId } });
  if (!session || session.status !== "WAITING" || session.tutorId) {
    throw new Error("This session is no longer available");
  }

  await prisma.$transaction([
    prisma.chatSession.update({
      where: { id: chatSessionId },
      data: { tutorId: user.id, status: "ACTIVE", matchedAt: new Date() },
    }),
    prisma.notification.updateMany({
      where: { chatSessionId, userId: user.id, read: false },
      data: { read: true },
    }),
  ]);

  revalidatePath("/chat");
  revalidatePath("/tutor");
  redirect(`/chat/${chatSessionId}`);
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
