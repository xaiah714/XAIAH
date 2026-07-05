import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { SUBJECTS } from "@/lib/subjects";
import { getVerificationState } from "@/lib/consensus";
import { SeedLoadForm } from "./seed-load-form";

export const metadata = { title: "Library Builder — TutorApp admin" };

export default async function LibraryBuilderPage() {
  await requireRole("ADMIN");

  const seeds = await prisma.question.findMany({
    where: { isSeeded: true },
    select: {
      id: true,
      subject: true,
      status: true,
      seedClaimedById: true,
      disputedAt: true,
      disputeResolvedAt: true,
      answers: {
        where: { isVerifiedTutorAnswer: true },
        select: {
          id: true,
          authorId: true,
          isVerifiedTutorAnswer: true,
          agreesWithPrior: true,
          endorsements: { select: { tutorId: true } },
        },
      },
    },
  });

  const rows = SUBJECTS.map((s) => {
    const inSubject = seeds.filter((q) => q.subject === s.value);
    const answered = inSubject.filter((q) => q.status !== "OPEN");
    return {
      subject: s.label,
      loaded: inSubject.length,
      claimed: inSubject.filter((q) => q.seedClaimedById && q.status === "OPEN").length,
      answered: answered.length,
      verified: inSubject.filter((q) => {
        const v = getVerificationState(q);
        return v.kind === "VERIFIED" || v.kind === "RESOLVED";
      }).length,
    };
  }).filter((r) => r.loaded > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Library Builder</h1>
        <Link href="/admin" className="text-sm font-medium text-brand-teal hover:underline">
          &larr; Admin dashboard
        </Link>
      </div>
      <p className="mt-1 text-sm text-brand-muted">
        Load target questions in bulk; tutors answer them from their Library Building queue
        with the normal reasoning + verification flow. Answered seeds appear in the public
        answer bank exactly like organic questions.
      </p>

      <div className="card mt-6">
        <h2 className="font-semibold">Load questions</h2>
        <p className="mt-1 text-xs text-brand-muted">
          One per line: <code>SUBJECT | title | body | textbook (optional) | course (optional)</code>
          <br />
          Example: <code>MATH | Solve 2x+6=14 | Show each step. | | Algebra 1</code>
          <br />
          Subjects: MATH, PHYSICS, CHEMISTRY, BIOLOGY, COMPUTER_SCIENCE, PSYCHOLOGY,
          PHILOSOPHY, NURSING, OTHER
        </p>
        <div className="mt-3">
          <SeedLoadForm />
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Seeding progress</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-brand-muted">Nothing loaded yet.</p>
      ) : (
        <div className="card mt-3 overflow-x-auto !p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-xs uppercase tracking-wide text-brand-muted">
                <th className="px-4 py-2">Subject</th>
                <th className="px-4 py-2">Loaded</th>
                <th className="px-4 py-2">Claimed</th>
                <th className="px-4 py-2">Answered</th>
                <th className="px-4 py-2">Verified</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.subject} className="border-b border-brand-border last:border-0">
                  <td className="px-4 py-2 font-medium">{r.subject}</td>
                  <td className="px-4 py-2">{r.loaded}</td>
                  <td className="px-4 py-2">{r.claimed}</td>
                  <td className="px-4 py-2">{r.answered}</td>
                  <td className="px-4 py-2">{r.verified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
