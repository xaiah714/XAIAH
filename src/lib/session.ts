import { cookies } from "next/headers";

const STUDENT_COOKIE = "student_id";

export async function getCurrentStudentId(): Promise<string | null> {
  const store = await cookies();
  return store.get(STUDENT_COOKIE)?.value ?? null;
}

export async function setCurrentStudentId(studentId: string) {
  const store = await cookies();
  store.set(STUDENT_COOKIE, studentId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
