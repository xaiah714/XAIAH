import Link from "next/link";
import { getCurrentStudentId } from "@/lib/session";
import { prisma } from "@/lib/db";
import { syncMatchesForStudent, getStudentMatches, totalEligibleAmount } from "@/lib/matching";
import { formatCurrency } from "@/lib/format";
import ScholarshipCard from "@/components/scholarship-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const studentId = await getCurrentStudentId();
  const student = studentId
    ? await prisma.student.findUnique({ where: { id: studentId } })
    : null;

  if (!student) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-slate-600">We don&apos;t have a profile for you yet.</p>
        <Link
          href="/profile"
          className="rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Build my profile
        </Link>
      </main>
    );
  }

  await syncMatchesForStudent(student.id);
  const matches = await getStudentMatches(student.id);
  const total = totalEligibleAmount(matches);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-2xl bg-brand-600 p-8 text-white shadow-sm">
        <p className="text-sm font-medium text-brand-100">You&apos;re currently eligible for</p>
        <p className="text-4xl font-bold tracking-tight sm:text-5xl">{formatCurrency(total)}</p>
        <p className="mt-2 text-sm text-brand-100">
          across {matches.length} matched scholarship{matches.length === 1 ? "" : "s"}. Keep your
          profile updated to unlock more.
        </p>
        <Link
          href="/profile"
          className="mt-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
        >
          Update profile
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Your matches</h2>
        {matches.length === 0 && (
          <p className="text-sm text-slate-500">
            No matches yet — check back as we add more scholarships, or update your profile.
          </p>
        )}
        {matches.map((match) => (
          <ScholarshipCard key={match.id} match={match} />
        ))}
      </div>
    </main>
  );
}
