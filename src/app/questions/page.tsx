import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SUBJECTS, subjectLabel } from "@/lib/subjects";
import type { Subject } from "@/generated/prisma/client";

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; q?: string }>;
}) {
  const { subject, q } = await searchParams;
  const validSubject = SUBJECTS.some((s) => s.value === subject)
    ? (subject as Subject)
    : undefined;
  const query = q?.trim();

  const questions = await prisma.question.findMany({
    where: {
      subject: validSubject,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { body: { contains: query, mode: "insensitive" } },
              { courseName: { contains: query, mode: "insensitive" } },
              { textbookName: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: query ? [{ answers: { _count: "desc" } }, { createdAt: "desc" }] : { createdAt: "desc" },
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

      <form action="/questions" method="get" className="mt-4 flex gap-2">
        {validSubject && <input type="hidden" name="subject" value={validSubject} />}
        <input
          type="search"
          name="q"
          defaultValue={query ?? ""}
          placeholder="Search already-answered questions..."
          className="input"
        />
        <button type="submit" className="btn-secondary !px-4 !py-2 text-sm">
          Search
        </button>
      </form>

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
        {questions.map((question) => (
          <li key={question.id}>
            <Link href={`/questions/${question.id}`} className="card block hover:border-brand-teal">
              <div className="flex items-center justify-between gap-2">
                <span className="badge-community">{subjectLabel(question.subject)}</span>
                <span className="text-xs text-brand-muted">
                  {question._count.answers} {question._count.answers === 1 ? "answer" : "answers"} ·{" "}
                  {question.status === "RESOLVED"
                    ? "Resolved"
                    : question.status === "ANSWERED"
                      ? "Answered"
                      : "Open"}
                </span>
              </div>
              <h2 className="mt-2 font-semibold">{question.title}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
