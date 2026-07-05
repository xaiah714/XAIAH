"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { verifyTotp, generateTotpSecret } from "@/lib/totp";

export type TwoFactorState = { error?: string };

/**
 * Persists a pending (unconfirmed) secret so the QR code stays stable across
 * reloads until the user confirms it — generating a fresh secret on every
 * page render would let the scanned QR and the confirmed secret drift apart.
 */
export async function startTwoFactorSetupAction() {
  const user = await requireUser();
  const current = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

  if (!current.twoFactorEnabled && !current.twoFactorSecret) {
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: generateTotpSecret() },
    });
  }

  revalidatePath("/account/security");
}

export async function cancelTwoFactorSetupAction() {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: null, twoFactorEnabled: false },
  });
  revalidatePath("/account/security");
}

const confirmSchema = z.object({ code: z.string().min(6).max(6) });

export async function confirmTwoFactorAction(
  _prevState: TwoFactorState,
  formData: FormData
): Promise<TwoFactorState> {
  const sessionUser = await requireUser();

  const parsed = confirmSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) return { error: "Enter the 6-digit code from your app" };

  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  if (!user.twoFactorSecret) return { error: "Start setup again from the security page" };

  if (!verifyTotp(user.twoFactorSecret, parsed.data.code)) {
    return { error: "That code didn't match — try the current one from your app" };
  }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { twoFactorEnabled: true },
  });

  revalidatePath("/account/security");
  return {};
}

const disableSchema = z.object({ code: z.string().min(6).max(6) });

export async function disableTwoFactorAction(
  _prevState: TwoFactorState,
  formData: FormData
): Promise<TwoFactorState> {
  const sessionUser = await requireUser();
  const parsed = disableSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) return { error: "Enter the 6-digit code from your app" };

  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  if (!user.twoFactorEnabled || !user.twoFactorSecret) return { error: "2FA isn't enabled" };

  if (!verifyTotp(user.twoFactorSecret, parsed.data.code)) {
    return { error: "That code didn't match" };
  }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  revalidatePath("/account/security");
  return {};
}
