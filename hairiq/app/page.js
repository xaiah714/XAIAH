import Link from "next/link";

// Landing — one decision on screen: take the quiz (spec sections 3–4).
export default function LandingPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* soft decorative blobs — pink + orange only, per the theme rules */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blush opacity-60 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-1/3 h-80 w-80 rounded-full bg-coral opacity-30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-blush opacity-50 blur-3xl" />

      <div className="animate-rise relative flex max-w-md flex-col items-center">
        {/* logo placeholder — swap for the real wordmark later (spec §13) */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blush to-coral text-5xl shadow-soft">
          <span aria-hidden="true">💆‍♀️</span>
        </div>

        <h1 className="font-display text-5xl font-bold tracking-tight">
          Hair<span className="text-coral-deep">IQ</span>
        </h1>

        <p className="mt-4 text-lg font-semibold text-cocoa-soft">
          Ten quick questions. One personalized hair routine — with picks for every budget.
        </p>

        <Link
          href="/quiz"
          className="mt-10 inline-block rounded-full bg-coral px-12 py-5 font-display text-xl font-bold text-cocoa shadow-soft transition hover:bg-coral-deep hover:text-cream active:scale-95"
        >
          Take the Quiz
        </Link>

        <p className="mt-5 text-sm font-semibold text-cocoa-soft/80">
          ≈ 2 minutes · no account needed
        </p>
      </div>
    </main>
  );
}
