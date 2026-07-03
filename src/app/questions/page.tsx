import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SUBJECTS, subjectLabel } from "@/lib/subjects";
import type { Subject } from "@/generated/prisma/client";

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  const validSubject = SUBJECTS.some((s) => s.value === subject)
    ? (subject as Subject)
    : undefined;

  const questions = await prisma.question.findMany({
    where: validSubject ? { subject: validSubject } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { answers: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Community Q&amp;A</h1>
        <Link href="/questions/new" className="btn-primary !px-4 !py-2 text-sm">
          Ask a question
        </Link>
      </div>
      <p className="mt-1 text-sm text-brand-muted">
        Free, unlimited, always. Every question gets a place to be answered.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/questions"
          className={`badge-community !rounded-full ${!validSubject ? "ring-2 ring-brand-purple" : ""}`}
        >
          All
        </Link>
        {SUBJECTS.map((s) => (
          <Link
            key={s.value}
            href={`/questions?subject=${s.value}`}
            className={`badge-community !rounded-full ${validSubject === s.value ? "ring-2 ring-brand-purple" : ""}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {questions.length === 0 && (
          <li className="card text-sm text-brand-muted">
            No questions yet. Be the first to ask.
          </li>
        )}
        {questions.map((q) => (
          <li key={q.id}>
            <Link href={`/questions/${q.id}`} className="card block hover:border-brand-teal">
              <div className="flex items-center justify-between gap-2">
                <span className="badge-community">{subjectLabel(q.subject)}</span>
                <span className="text-xs text-brand-muted">
                  {q._count.answers} {q._count.answers === 1 ? "answer" : "answers"} ·{" "}
                  {q.status === "RESOLVED" ? "Resolved" : q.status === "ANSWERED" ? "Answered" : "Open"}
                </span>
              </div>
              <h2 className="mt-2 font-semibold">{q.title}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
