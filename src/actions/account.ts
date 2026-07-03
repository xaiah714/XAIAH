"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

const GENDER_VALUES = ["MALE", "FEMALE", "NONBINARY", "UNSPECIFIED"] as const;

const profileSchema = z.object({
  timezone: z.string().min(1),
  gender: z.enum(GENDER_VALUES),
});

export type ProfileState = { error?: string; success?: boolean };

export async function updateProfileAction(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    timezone: formData.get("timezone"),
    gender: formData.get("gender"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
  });

  revalidatePath("/account");
  return { success: true };
}
