import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

export async function getSession(): Promise<Session | null> {
  return auth();
}

export async function requireUser(): Promise<Session["user"]> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireRole(
  role: "STUDENT" | "TUTOR" | "ADMIN"
): Promise<Session["user"]> {
  const user = await requireUser();
  if (user.role !== role) redirect("/");
  return user;
}

/**
 * Gate for actions that post content or start a live session — "full
 * access" per the spec's email-verification requirement. Admins are
 * exempt (their accounts are provisioned out-of-band via the seed script,
 * not through signup).
 */
export async function requireVerifiedUser(): Promise<Session["user"]> {
  const user = await requireUser();
  if (user.role === "ADMIN") return user;

  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { emailVerified: true },
  });
  if (!dbUser.emailVerified) redirect("/verify-email");

  return user;
}

export async function requireVerifiedRole(
  role: "STUDENT" | "TUTOR" | "ADMIN"
): Promise<Session["user"]> {
  const user = await requireVerifiedUser();
  if (user.role !== role) redirect("/");
  return user;
}
