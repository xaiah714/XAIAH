"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

const TUTOR_STATUS_VALUES = ["APPLIED", "TRIAL", "ACTIVE", "SUSPENDED", "REMOVED"] as const;

const statusSchema = z.object({
  tutorId: z.string().min(1),
  status: z.enum(TUTOR_STATUS_VALUES),
});

export async function setTutorStatusAction(tutorId: string, status: string) {
  await requireRole("ADMIN");
  const parsed = statusSchema.safeParse({ tutorId, status });
  if (!parsed.success) throw new Error("Invalid input");

  await prisma.user.update({
    where: { id: parsed.data.tutorId },
    data: {
      tutorStatus: parsed.data.status,
      tutorVerified: parsed.data.status === "ACTIVE" || parsed.data.status === "TRIAL",
      tutorAvailable: parsed.data.status === "ACTIVE" ? undefined : false,
    },
  });

  revalidatePath("/admin/tutors");
}
