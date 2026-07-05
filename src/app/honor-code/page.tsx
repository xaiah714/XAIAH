import Link from "next/link";

export const metadata = { title: "Honor Code — TutorApp" };

export default function HonorCodePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Honor Code &amp; Academic Integrity</h1>
      <p className="mt-2 text-brand-muted">
        TutorApp exists to help students actually understand their work — not to help anyone
        cheat. Here&apos;s what that means in practice.
      </p>

      <div className="card mt-8">
        <h2 className="font-semibold">What TutorApp is for</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          <li>✓ Homework help, with the reasoning shown — every answer must include steps.</li>
          <li>✓ Studying, reviewing, and preparing for exams.</li>
          <li>✓ Getting unstuck at midnight when nobody else is awake.</li>
          <li>✓ Learning the method your class actually uses.</li>
        </ul>
      </div>

      <div className="card mt-4">
        <h2 className="font-semibold">What it&apos;s not for</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          <li>✗ Live exams, quizzes, or any assessment you&apos;re meant to complete alone.</li>
          <li>✗ Submitting a tutor&apos;s words as your own work.</li>
          <li>✗ Circumventing your school&apos;s own academic-integrity policies.</li>
        </ul>
        <p className="mt-3 text-sm text-brand-muted">
          Tutors are asked to decline requests that look like active assessments, and
          accounts that repeatedly try are suspended. Your school&apos;s rules are the final
          word — when in doubt, ask your instructor whether outside help is allowed.
        </p>
      </div>

      <div className="card mt-4" id="verification">
        <h2 className="font-semibold">Why answers here can be trusted</h2>
        <p className="mt-2 text-sm text-brand-muted">
          Every answer on TutorApp comes from a vetted human tutor and must show its
          reasoning — a bare final answer can&apos;t even be submitted. When a second
          verified tutor independently agrees, the question earns a visible
          &ldquo;Verified by N tutors&rdquo; badge. If tutors disagree, no badge is shown:
          the question goes to a review board of every tutor in that subject, and their
          consensus resolves it. Students can flag any answer as incomplete or incorrect,
          and tutors whose answers keep getting flagged stop receiving new requests. None
          of this is AI-generated — it&apos;s people checking people&apos;s work.
        </p>
      </div>

      <div className="card mt-4">
        <h2 className="font-semibold">For schools and organizations</h2>
        <p className="mt-2 text-sm text-brand-muted">
          We built this policy — and the show-your-reasoning requirement behind it — because
          we want TutorApp to be something educators can endorse, not something students
          hide. If you&apos;re an educator or program that wants to talk about how TutorApp
          handles integrity, <Link href="/help" className="underline">get in touch</Link>.
        </p>
      </div>
    </div>
  );
}
