import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SUBJECTS, subjectLabel } from "@/lib/subjects";
import { getVerificationState } from "@/lib/consensus";

export default async function Home() {
  const recentQuestions = await prisma.question.findMany({
    where: { status: { in: ["ANSWERED", "RESOLVED"] } },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: {
      _count: { select: { answers: true } },
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

  return (
    <div>
      {/* Search-first hero — the one primary action */}
      <section className="border-b border-brand-border bg-brand-surface">
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Find your question
          </h1>
          <p className="mt-2 text-brand-muted">
            Search answers verified by real tutors — or ask and get one.
          </p>
          <form action="/questions" method="get" className="mx-auto mt-6 flex max-w-xl gap-2">
            <input
              type="search"
              name="q"
              placeholder="Search a problem, topic, or textbook..."
              className="input !py-4 text-base"
              aria-label="Search the answer bank"
            />
            <button type="submit" className="btn-primary !px-6">
              Search
            </button>
          </form>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SUBJECTS.filter((s) => s.value !== "OTHER").map((s) => (
              <Link
                key={s.value}
                href={`/questions?subject=${s.value}`}
                className="badge-community !rounded-full hover:ring-2 hover:ring-brand-teal"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* The three things you can do, right now */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/questions/new" className="card block hover:border-brand-teal">
            <div className="badge-community mb-3">Free, always</div>
            <h2 className="text-lg font-semibold">Ask a question</h2>
            <p className="mt-2 text-sm text-brand-muted">
              Post it with a photo of your work. Verified tutors answer with their steps shown
              — never just a bare result.
            </p>
          </Link>
          <Link href="/chat/new" className="card block hover:border-brand-teal">
            <div className="badge-verified mb-3">24/7 live help</div>
            <h2 className="text-lg font-semibold">Chat with a verified tutor</h2>
            <p className="mt-2 text-sm text-brand-muted">
              Matched by subject with a tutor who&apos;s awake now, anywhere in the world.
            </p>
          </Link>
          <Link href="/questions" className="card block hover:border-brand-teal">
            <div className="badge-verified mb-3">Tutor-verified</div>
            <h2 className="text-lg font-semibold">Browse the answer bank</h2>
            <p className="mt-2 text-sm text-brand-muted">
              Answers cross-checked by multiple tutors carry a &ldquo;Verified by N
              tutors&rdquo; badge you can trust.
            </p>
          </Link>
        </div>
      </section>

      {/* Real content, immediately visible */}
      {recentQuestions.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recently answered</h2>
            <Link href="/questions" className="text-sm font-medium text-brand-teal hover:underline">
              See all &rarr;
            </Link>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentQuestions.map((q) => {
              const v = getVerificationState(q);
              return (
                <li key={q.id}>
                  <Link href={`/questions/${q.id}`} className="card block h-full hover:border-brand-teal">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge-community">{subjectLabel(q.subject)}</span>
                      {(v.kind === "VERIFIED" || v.kind === "RESOLVED") && (
                        <span className="badge-verified">✓✓ {v.tutorCount} tutors</span>
                      )}
                    </div>
                    <h3 className="mt-2 line-clamp-2 font-semibold">{q.title}</h3>
                    <p className="mt-1 text-xs text-brand-muted">
                      {q._count.answers} answer{q._count.answers === 1 ? "" : "s"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* How it works — condensed, below the fold */}
      <section className="border-t border-brand-border">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h2 className="text-lg font-semibold">How it works</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="text-sm">
              <p className="font-semibold">1. Ask or search</p>
              <p className="mt-1 text-brand-muted">
                Community Q&amp;A is free and unlimited — no caps, no paywall.
              </p>
            </div>
            <div className="text-sm">
              <p className="font-semibold">2. Real tutors answer</p>
              <p className="mt-1 text-brand-muted">
                Every tutor is vetted; every answer shows its reasoning. Tutors cross-check
                each other, and disagreements go to a subject review board.
              </p>
            </div>
            <div className="text-sm">
              <p className="font-semibold">3. Go live when you need it</p>
              <p className="mt-1 text-brand-muted">
                Stuck at 3 AM? A verified tutor is awake somewhere — live chat is one click
                away, day or night.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing — kept, but deliberately not the first thing a student sees */}
      <section className="border-t border-brand-border bg-brand-surface">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h2 className="text-lg font-semibold">Simple pricing</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="card">
              <p className="font-semibold">Community Q&amp;A</p>
              <p className="mt-1 text-2xl font-bold">Free</p>
              <p className="mt-1 text-sm text-brand-muted">Forever. No limits, no tricks.</p>
            </div>
            <div className="card border-brand-teal">
              <p className="font-semibold">Unlimited live chat</p>
              <p className="mt-1 text-2xl font-bold">
                $7<span className="text-sm font-normal text-brand-muted">/mo</span>
              </p>
              <p className="mt-1 text-sm text-brand-muted">
                A fraction of what other study sites charge.
              </p>
            </div>
            <div className="card">
              <p className="font-semibold">Pay per session</p>
              <p className="mt-1 text-2xl font-bold">$3</p>
              <p className="mt-1 text-sm text-brand-muted">
                One live session, no subscription. Tip your tutor if they saved you.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-brand-muted">
            <Link href="/signup" className="font-medium text-brand-teal hover:underline">
              Create a free account
            </Link>{" "}
            to ask your first question.
          </p>
        </div>
      </section>
    </div>
  );
}
