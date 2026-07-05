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

/**
 * Manual escape hatches so the owner can verify testers from the admin
 * dashboard on a phone — no Resend key, no logs, no terminal needed.
 */
export async function manuallyVerifyUserAction(userId: string) {
  await requireRole("ADMIN");
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { userId, purpose: "EMAIL_VERIFY" } });
  revalidatePath("/admin");
}

export async function resendVerificationAction(userId: string) {
  await requireRole("ADMIN");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, emailVerified: true },
  });
  if (user.emailVerified) return;
  const { issueEmailVerification } = await import("@/lib/verification");
  await issueEmailVerification(user.id, user.email);
  revalidatePath("/admin");
}

/**
 * Library Builder: bulk-load seed questions to build answer inventory
 * before organic traffic. Format, one per line (textbook/course optional):
 *   SUBJECT | title | body | textbook | course
 * Seeded questions are authored by the admin, hidden from students until
 * answered, and never trigger tutor notifications or the delay sweep —
 * tutors pick them up from the Library Building queue on /tutor.
 */
const SEED_SUBJECTS = [
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

export type SeedLoadState = { error?: string; loaded?: number; skipped?: string[] };

export async function bulkLoadSeedQuestionsAction(
  _prevState: SeedLoadState,
  formData: FormData
): Promise<SeedLoadState> {
  const admin = await requireRole("ADMIN");
  const raw = String(formData.get("lines") ?? "");
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { error: "Paste at least one line" };
  if (lines.length > 500) return { error: "Max 500 questions per batch" };

  const skipped: string[] = [];
  let loaded = 0;

  for (const line of lines) {
    const parts = line.split("|").map((p) => p.trim());
    const [subjectRaw, title, body, textbook, course] = parts;
    const subject = SEED_SUBJECTS.find(
      (s) => s === subjectRaw?.toUpperCase().replace(/[\s-]+/g, "_")
    );
    if (!subject || !title || title.length < 4 || !body) {
      skipped.push(line.slice(0, 60));
      continue;
    }
    await prisma.question.create({
      data: {
        authorId: admin.id,
        subject,
        title: title.slice(0, 200),
        body,
        isSeeded: true,
        textbookName: textbook || undefined,
        courseName: course || undefined,
      },
    });
    loaded++;
  }

  revalidatePath("/admin/library");
  return { loaded, skipped };
}
