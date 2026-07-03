import { redirect } from "next/navigation";
import { auth } from "@/auth";
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
