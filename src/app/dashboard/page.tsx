import Link from "next/link";
import { getCurrentStudentId } from "@/lib/session";
import { prisma } from "@/lib/db";
import {
  syncMatchesForStudent,
  getStudentMatches,
  totalEligibleAmountsByCurrency,
  toClientMatch,
} from "@/lib/matching";
import { formatCurrency } from "@/lib/format";
import MatchesBrowser from "@/components/matches-browser";

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
          className="min-h-[48px] rounded-full bg-accent-500 px-6 py-2 text-sm font-semibold text-brand-950 hover:bg-accent-600"
        >
          Build my profile
        </Link>
      </main>
    );
  }

  await syncMatchesForStudent(student.id);
  const matches = await getStudentMatches(student.id);
  const clientMatches = matches.map(toClientMatch);
  const totals = totalEligibleAmountsByCurrency(matches);
  const [headlineTotal, ...otherTotals] = totals;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-2xl bg-brand-950 p-8 text-white shadow-sm">
        <p className="text-sm font-medium text-brand-200">You&apos;re currently eligible for</p>
        <p className="text-4xl font-bold tracking-tight text-accent-400 sm:text-5xl">
          {headlineTotal ? formatCurrency(headlineTotal.amount, headlineTotal.currencyCode) : "$0"}
        </p>
        {otherTotals.length > 0 && (
          <p className="mt-1 text-sm text-brand-200">
            plus{" "}
            {otherTotals
              .map((t) => formatCurrency(t.amount, t.currencyCode))
              .join(" and ")}{" "}
            in other currencies
          </p>
        )}
        <p className="mt-2 text-sm text-brand-200">
          across {matches.length} matched scholarship{matches.length === 1 ? "" : "s"} and grants.
          Keep your profile updated to unlock more.
        </p>
        <Link
          href="/profile"
          className="mt-4 inline-block min-h-[40px] rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/25"
        >
          Update profile
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-brand-950">Your matches</h2>
        {matches.length === 0 ? (
          <p className="text-sm text-slate-500">
            No matches yet — check back as we add more scholarships, or update your profile.
          </p>
        ) : (
          <MatchesBrowser matches={clientMatches} />
        )}
      </div>
    </main>
  );
}
