import Link from "next/link";
import { getCurrentStudentId } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const studentId = await getCurrentStudentId();
  const student = studentId
    ? await prisma.student.findUnique({ where: { id: studentId } })
    : null;

  if (!student) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-slate-600">
          We don&apos;t have a profile for you yet.
        </p>
        <Link
          href="/profile"
          className="rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Build my profile
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Welcome back, {student.email}</h1>
      <p className="mt-2 text-slate-600">
        Your matches and dollar-value dashboard are coming up next.
      </p>
    </main>
  );
}
