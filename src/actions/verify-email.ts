"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { issueEmailVerification } from "@/lib/verification";

const RESEND_COOLDOWN_MS = 60 * 1000;

export type ResendState = { error?: string; sent?: boolean };

export async function resendVerificationEmailAction(): Promise<ResendState> {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  if (user.emailVerified) return { error: "Already verified" };

  const recent = await prisma.verificationToken.findFirst({
    where: { userId: user.id, purpose: "EMAIL_VERIFY" },
    orderBy: { createdAt: "desc" },
  });
  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return { error: "Hang on a moment before requesting another email" };
  }

  await issueEmailVerification(user.id, user.email);
  return { sent: true };
}
