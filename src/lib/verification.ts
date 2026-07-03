import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function issueEmailVerification(userId: string, email: string) {
  await prisma.verificationToken.deleteMany({
    where: { userId, purpose: "EMAIL_VERIFY" },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      userId,
      token,
      purpose: "EMAIL_VERIFY",
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  await sendVerificationEmail(email, token);
}

export type ConsumeResult = "OK" | "INVALID" | "EXPIRED" | "ALREADY_VERIFIED";

export async function consumeEmailVerificationToken(token: string): Promise<ConsumeResult> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: { select: { emailVerified: true } } },
  });

  if (!record || record.purpose !== "EMAIL_VERIFY") return "INVALID";

  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return "EXPIRED";
  }

  if (record.user.emailVerified) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return "ALREADY_VERIFIED";
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.delete({ where: { id: record.id } }),
  ]);

  return "OK";
}
