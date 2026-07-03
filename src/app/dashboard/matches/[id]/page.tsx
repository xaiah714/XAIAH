import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentStudentId } from "@/lib/session";
import { ensureApplicationSteps } from "@/lib/steps";
import { formatAmountRange } from "@/lib/format";
import { LocalDeadline } from "@/components/local-date";
import WalkthroughSteps from "@/components/walkthrough-steps";

export const dynamic = "force-dynamic";

export default async function MatchWalkthroughPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const studentId = await getCurrentStudentId();
  if (!studentId) redirect("/profile");

  const match = await prisma.match.findUnique({
    where: { id },
    include: { scholarship: true },
  });

  if (!match || match.studentId !== studentId) notFound();

  const steps = await ensureApplicationSteps(id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/dashboard" className="text-sm font-medium text-brand-700 hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-brand-950">{match.scholarship.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{match.scholarship.orgName}</p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="font-semibold text-brand-950">
            {formatAmountRange(
              match.scholarship.amountMin,
              match.scholarship.amountMax,
              match.scholarship.currencyCode,
            )}
          </span>
          <LocalDeadline iso={match.scholarship.deadline.toISOString()} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-brand-950">Let&apos;s break this down</h2>
        <p className="mb-4 text-sm text-slate-500">
          One step at a time — check each one off as you go.
        </p>
        <WalkthroughSteps
          matchId={id}
          steps={steps.map((s) => ({
            id: s.id,
            type: s.type,
            label: s.label,
            completed: s.completed,
            order: s.order,
          }))}
        />
      </div>
    </main>
  );
}
