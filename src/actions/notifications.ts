"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

/**
 * Scoped to request notifications only — payout notifications (held funds,
 * expiry reminders) are surfaced and dismissed separately on
 * /account/payouts so a routine "mark all read" click here can never
 * silently clear a payout reminder the tutor hasn't actually seen.
 */
export async function markAllNotificationsReadAction() {
  const user = await requireRole("TUTOR");
  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      read: false,
      type: { in: ["NEW_QUESTION", "NEW_CHAT_REQUEST", "DISPUTE_REVIEW", "NEW_STUDENT_SIGNUP"] },
    },
    data: { read: true },
  });
  revalidatePath("/tutor");
}

export async function markPayoutNotificationsReadAction() {
  const user = await requireRole("TUTOR");
  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      read: false,
      type: { in: ["PAYOUT_HELD", "PAYOUT_REMINDER", "PAYOUT_RELEASED", "PAYOUT_EXPIRED"] },
    },
    data: { read: true },
  });
  revalidatePath("/account/payouts");
}
