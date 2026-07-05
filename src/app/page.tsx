import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SUBJECTS, subjectLabel } from "@/lib/subjects";
import { getVerificationState } from "@/lib/consensus";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does answer verification work?",
    a: "Every tutor on TutorApp is vetted before they can answer. When a second verified tutor independently confirms an answer, the question earns a \"Verified by N tutors\" badge. If two tutors disagree, the question goes to a review board of every tutor in that subject, and their consensus decides — no badge is shown until it's settled. You can always see who answered and check their profile.",
  },
  {
    q: "What's free and what's paid?",
    a: "Reading answers is always free — every answer, no unlock fees, no monthly cap. Asking questions is free too. The only paid thing on TutorApp is live 1-on-1 tutor chat: $5/month for unlimited sessions, or about $3 for a single session with no subscription.",
  },
  {
    q: "How does live tutor chat work?",
    a: "Tell us your subject and we notify every verified tutor who covers it and is awake right now, anywhere in the world. One claims your request and you chat 1-on-1 until you're unstuck. It's real humans, 24/7 — because tutors are global, someone is always online.",
  },
  {
    q: "Who are the tutors? How are they vetted?",
    a: "Real people — often college students and freelancers who are strong in a subject. Every tutor application is reviewed, and new tutors go through a trial period before they're fully active. Their public profile separates what TutorApp has verified (vetting, sessions completed, ratings) from what they say about themselves, so you always know which is which.",
  },
  {
    q: "Is this cheating? What's your academic integrity stance?",
    a: "TutorApp is built for understanding, not shortcuts. Every answer must show its reasoning — tutors can't just hand you a final result. We're here for homework help, studying, and getting unstuck; we don't help with active exams or graded assessments meant to be done alone. Read our full Honor Code for the details.",
  },
  {
    q: "How do I become a tutor?",
    a: "Sign up with a tutor account, pick your subjects, and submit your profile — an admin reviews every application. Once you're active you answer questions and take live chats whenever you want. Tutors are paid weekly: a share of subscription revenue based on chat time, 75% of pay-per-session fees, and 100% of tips.",
  },
  {
    q: "Do I need a subscription to ask a question?",
    a: "No. Asking and reading are completely free forever. A subscription only adds unlimited live 1-on-1 chat.",
  },
];

export default async function Home() {
  const session = await auth();
  const role = session?.user?.role;

  if (role === "TUTOR") redirect("/tutor");
  if (role === "ADMIN") redirect("/admin");
  if (role === "STUDENT") return <StudentHome userId={session!.user!.id!} />;

  return <MarketingHome />;
}

/* ── Signed-in students get a dashboard, not a sales pitch ─────────────── */
async function StudentHome({ userId }: { userId: string }) {
  const [user, myQuestions] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } }),
    prisma.question.findMany({
      where: { authorId: userId },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: { _count: { select: { answers: true } } },
    }),
  ]);

  const STATUS_LABEL: Record<string, string> = {
    OPEN: "Waiting for an answer",
    ANSWERED: "Answered — take a look",
    RESOLVED: "Resolved",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Hey {user.name.split(" ")[0]} 👋</h1>
      <p className="mt-1 text-sm text-brand-muted">What do you need help with today?</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link href="/questions/new" className="btn-primary text-center">
          Ask a question
        </Link>
        <Link href="/chat/new" className="btn-secondary text-center">
          Start live tutor chat
        </Link>
        <Link href="/questions" className="btn-secondary text-center">
          Browse answers
        </Link>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Your questions</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {myQuestions.length === 0 && (
          <li className="card text-sm text-brand-muted">
            You haven&apos;t asked anything yet — your first question is free (they all are).
          </li>
        )}
        {myQuestions.map((q) => (
          <li key={q.id}>
            <Link href={`/questions/${q.id}`} className="card block hover:border-brand-teal">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="badge-community">{subjectLabel(q.subject)}</span>
                <span
                  className={`text-xs font-medium ${q.status === "OPEN" ? "text-brand-muted" : "text-brand-teal-dark"}`}
                >
                  {STATUS_LABEL[q.status]} · {q._count.answers} answer
                  {q._count.answers === 1 ? "" : "s"}
                </span>
              </div>
              <h3 className="mt-2 font-semibold">{q.title}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Signed-out visitors get the product-first marketing page ──────────── */
async function MarketingHome() {
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
      {/* 1. Hero — warm headline, one search box, photo icon wired to photo questions */}
      <section className="border-b border-brand-border bg-brand-surface">
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-14 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Stuck? Let&apos;s get you unstuck.
          </h1>
          <p className="mt-2 text-brand-muted">
            What would you like help with today?
          </p>
          <form action="/questions" method="get" className="mx-auto mt-6 flex max-w-xl items-stretch gap-2">
            <div className="relative flex-1">
              <input
                type="search"
                name="q"
                placeholder="Search a problem, topic, or textbook..."
                className="input !py-4 !pr-12 text-base"
                aria-label="Search the answer bank"
              />
              <Link
                href="/questions/new"
                title="Snap a photo of your problem instead"
                aria-label="Ask with a photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
              >
                📷
              </Link>
            </div>
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

      {/* 2. Three value cards */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card">
            <div className="badge-verified mb-3">✓✓ Verified by real tutors</div>
            <h2 className="text-lg font-semibold">Every answer independently confirmed</h2>
            <p className="mt-2 text-sm text-brand-muted">
              Vetted human tutors answer with their reasoning shown, and other tutors
              cross-check them. Never AI guesses.
            </p>
          </div>
          <div className="card">
            <div className="badge-community mb-3">Free to read, always</div>
            <h2 className="text-lg font-semibold">No unlock fees, ever</h2>
            <p className="mt-2 text-sm text-brand-muted">
              Unlike Chegg, you&apos;ll never hit a paywall to see an answer. Search it, read
              it, learn from it — free.
            </p>
          </div>
          <div className="card">
            <div className="badge-verified mb-3">24/7 live humans</div>
            <h2 className="text-lg font-semibold">A real person at 1 AM</h2>
            <p className="mt-2 text-sm text-brand-muted">
              Subscribers get unlimited live 1-on-1 chat with verified tutors around the
              world — someone is always awake.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Trust — the verification system is the badge */}
      <section className="border-y border-brand-border bg-brand-surface">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-10 sm:flex-row">
          <div className="card shrink-0 border-brand-teal text-center">
            <p className="text-3xl">✓✓</p>
            <p className="mt-1 font-bold text-brand-teal-dark">Verified by 2 tutors</p>
            <p className="mt-1 text-xs text-brand-muted">the badge that means it&apos;s right</p>
          </div>
          <div>
            <h2 className="text-xl font-bold">No second-guessing necessary</h2>
            <p className="mt-2 text-sm text-brand-muted">
              An answer only earns its badge when at least two verified tutors independently
              agree on it. If tutors ever disagree, the question goes to a review board of
              every tutor in that subject and their consensus settles it — you&apos;ll never
              see a badge on a disputed answer. Flag anything that looks off and tutors who
              keep getting it wrong stop receiving new requests.
            </p>
            <Link href="/honor-code#verification" className="mt-3 inline-block text-sm font-medium text-brand-teal hover:underline">
              How verification works &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Social proof — honest placeholder until real stats exist */}
      <section className="mx-auto max-w-5xl px-4 py-10 text-center">
        <h2 className="text-xl font-bold">Built with students, for students</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-brand-muted">
          TutorApp is young and shaped directly by the students testing it — the features
          here exist because someone stuck at midnight asked for them. Real testimonials and
          grade stats will live here once our early users have had their say (we&apos;d
          rather show you nothing than make numbers up).
        </p>
      </section>

      {/* 5. FAQs */}
      <section className="border-t border-brand-border bg-brand-surface">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h2 className="text-xl font-bold">Questions, answered</h2>
          <div className="mt-4 flex flex-col gap-2">
            {FAQS.map((f) => (
              <details key={f.q} className="card group !p-0">
                <summary className="cursor-pointer list-none px-6 py-4 font-semibold marker:content-none">
                  <span className="mr-2 inline-block transition group-open:rotate-90">▸</span>
                  {f.q}
                </summary>
                <p className="px-6 pb-4 text-sm text-brand-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Recently answered feed */}
      {recentQuestions.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-10">
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
                    <p className="mt-1 text-sm font-medium text-brand-teal">
                      See answer — free &rarr;
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
