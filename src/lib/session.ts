import { auth } from "@/auth";

/** The signed-in student's id (their User row id), or null if not authenticated. */
export async function getCurrentStudentId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
