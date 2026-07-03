"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

const GENDER_VALUES = ["MALE", "FEMALE", "NONBINARY", "UNSPECIFIED"] as const;
const GRADE_LEVEL_VALUES = ["MIDDLE_SCHOOL", "HIGH_SCHOOL", "COLLEGE", "GRAD", "OTHER"] as const;

const profileSchema = z.object({
  timezone: z.string().min(1),
  gender: z.enum(GENDER_VALUES),
  gradeLevel: z.enum(GRADE_LEVEL_VALUES).optional(),
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
    gradeLevel: formData.get("gradeLevel") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      timezone: parsed.data.timezone,
      gender: parsed.data.gender,
      gradeLevel: user.role === "STUDENT" ? parsed.data.gradeLevel : undefined,
    },
  });

  revalidatePath("/account");
  return { success: true };
}
