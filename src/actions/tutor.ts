"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

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

const currentYear = new Date().getFullYear();

const tutorProfileSchema = z.object({
  bio: z.string().max(2000).optional(),
  subjects: z.array(z.enum(SUBJECT_VALUES)).min(1, "Pick at least one subject"),
  school: z.string().max(200).optional(),
  degree: z.string().max(200).optional(),
  gradYear: z.coerce
    .number()
    .int()
    .min(1950, "Enter a real graduation year")
    .max(currentYear + 10, "Enter a real graduation year")
    .optional(),
  credentials: z.string().max(2000).optional(),
});

export type TutorProfileState = { error?: string; success?: boolean };

export async function updateTutorProfileAction(
  _prevState: TutorProfileState,
  formData: FormData
): Promise<TutorProfileState> {
  const user = await requireRole("TUTOR");

  const parsed = tutorProfileSchema.safeParse({
    bio: formData.get("bio") || undefined,
    subjects: formData.getAll("subjects"),
    school: formData.get("school") || undefined,
    degree: formData.get("degree") || undefined,
    gradYear: formData.get("gradYear") || undefined,
    credentials: formData.get("credentials") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      tutorBio: parsed.data.bio ?? null,
      tutorSubjects: parsed.data.subjects,
      tutorSchool: parsed.data.school ?? null,
      tutorDegree: parsed.data.degree ?? null,
      tutorGradYear: parsed.data.gradYear ?? null,
      tutorCredentials: parsed.data.credentials ?? null,
    },
  });

  revalidatePath("/tutor");
  revalidatePath(`/tutors/${user.id}`);
  return { success: true };
}

export async function toggleAvailabilityAction() {
  const user = await requireRole("TUTOR");

  const current = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  await prisma.user.update({
    where: { id: user.id },
    data: { tutorAvailable: !current.tutorAvailable },
  });

  revalidatePath("/tutor");
}
