import Link from "next/link";
import { redirect } from "next/navigation";
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
import AuthHeader from "@/components/auth-header";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const studentId = await getCurrentStudentId();
  if (!studentId) redirect("/login");

  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student) redirect("/login");

  // First sign-in creates the account but not a profile — send them to the
  // intake form once before showing an empty dashboard.
  const hasProfile =
    student.major || student.gpa != null || student.school || student.year || student.demographics.length > 0;
  if (!hasProfile) redirect("/profile");

  await syncMatchesForStudent(student.id);
  const matches = await getStudentMatches(student.id);
  const clientMatches = matches.map(toClientMatch);
  const totals = totalEligibleAmountsByCurrency(matches);
  const [headlineTotal, ...otherTotals] = totals;

  return (
    <main>
      <AuthHeader />
      <div className="mx-auto max-w-3xl px-6 pb-10 pt-2">
        <div className="rounded-2xl bg-brand-950 p-8 text-white shadow-sm">
          <p className="text-sm font-medium text-brand-200">You&apos;re currently eligible for</p>
          <p className="text-4xl font-bold tracking-tight text-accent-400 sm:text-5xl">
            {headlineTotal ? formatCurrency(headlineTotal.amount, headlineTotal.currencyCode) : "$0"}
          </p>
          {otherTotals.length > 0 && (
            <p className="mt-1 text-sm text-brand-200">
              plus {otherTotals.map((t) => formatCurrency(t.amount, t.currencyCode)).join(" and ")} in
              other currencies
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
      </div>
    </main>
  );
}
