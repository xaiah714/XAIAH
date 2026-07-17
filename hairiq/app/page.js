import Link from "next/link";
import Logo from "@/components/Logo";
import SavedRoutineLink from "@/components/SavedRoutineLink";

// Landing — one decision on screen: take the quiz (spec sections 3–4).
export default function LandingPage() {
  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{
        // soft blurred pink↔orange gradient (rev 7 owner request)
        background:
          "radial-gradient(90% 70% at 15% 0%, #ff61a3 0%, rgb(255 97 163 / 0) 60%)," +
          "radial-gradient(80% 65% at 100% 30%, #ff8d61 0%, rgb(255 141 97 / 0) 62%)," +
          "radial-gradient(95% 80% at 40% 110%, #ffab74 0%, rgb(255 171 116 / 0) 65%)," +
          "linear-gradient(160deg, #ffb4d5 0%, #ffc4b8 55%, #ffb4d5 100%)",
      }}
    >
      {/* extra blur layer so the gradient reads soft, never banded */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blush-deep opacity-40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-1/3 h-96 w-96 rounded-full bg-coral opacity-50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-blush opacity-60 blur-3xl"
      />

      <div className="animate-rise relative flex max-w-md flex-col items-center">
        <Logo className="mb-6 h-24 w-24 shadow-soft" />

        <h1 className="font-title text-5xl leading-snug sm:text-6xl" style={{ textWrap: "balance" }}>
          How Is My <span className="text-coral-deep">Hair</span>
        </h1>

        <p className="mt-4 text-lg font-semibold text-cocoa-soft">
          Eleven quick questions. One personalized hair routine — with picks for every budget.
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

        {/* premium: shows only when a saved routine exists on this device */}
        <SavedRoutineLink />
      </div>
    </main>
  );
}
