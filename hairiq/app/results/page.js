"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isQuizComplete } from "@/lib/questions";
import { buildRoutine } from "@/lib/recommendations";
import { PREMIUM } from "@/lib/config";
import { useQuiz } from "@/components/QuizProvider";
import TierTabs from "@/components/TierTabs";
import StepCard from "@/components/StepCard";
import NoteCard from "@/components/NoteCard";
import EmailSignup from "@/components/EmailSignup";

export default function ResultsPage() {
  const router = useRouter();
  const { answers, reset, ready } = useQuiz();
  const complete = ready && isQuizComplete(answers);

  // No answers (deep link / expired session) → back to the quiz.
  useEffect(() => {
    if (ready && !complete) router.replace("/quiz");
  }, [ready, complete, router]);

  // All three tiers come back pre-calculated in one pass (spec §1, §4).
  const routine = useMemo(() => (complete ? buildRoutine(answers) : null), [complete, answers]);

  const [tier, setTier] = useState(null);
  useEffect(() => {
    if (routine && tier === null) setTier(routine.defaultTier);
  }, [routine, tier]);

  if (!routine || tier === null) return null;

  function retake() {
    reset();
    router.push("/quiz");
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pb-16 pt-10">
      {/* summary header */}
      <header className="animate-rise text-center">
        <p className="font-display text-sm font-bold uppercase tracking-widest text-coral-deep">
          Your routine is ready ✨
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight">
          {routine.summary.headline}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base font-semibold text-cocoa-soft">
          {routine.summary.blurb}
        </p>
        <ul className="mt-5 flex flex-wrap justify-center gap-2">
          {routine.summary.chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full bg-blush/60 px-3.5 py-1.5 text-xs font-extrabold text-cocoa"
            >
              {chip}
            </li>
          ))}
        </ul>
      </header>

      {/* tier tabs — always live, all three pre-calculated */}
      <div className="sticky top-0 z-10 -mx-6 mt-8 bg-cream/95 px-6 py-3 backdrop-blur-sm">
        <TierTabs activeTier={tier} onChange={setTier} />
      </div>
      {tier === "crueltyFree" ? (
        <p className="mt-3 text-center text-xs font-semibold text-cocoa-soft">
          🐰 Certified or independently tracked cruelty-free — across every price point.
          Certifications can change; verify via Leaping Bunny or PETA before you buy.
        </p>
      ) : null}

      {/* routine phases */}
      <div className="mt-8 space-y-10">
        {routine.phases.map((phase) =>
          phase.steps.length === 0 ? null : (
            <section key={phase.id} className="animate-rise">
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-2xl font-bold">
                  <span aria-hidden="true" className="mr-2">
                    {phase.emoji}
                  </span>
                  {phase.title}
                </h2>
              </div>
              {phase.intro ? (
                <p className="mt-2 text-sm font-semibold leading-relaxed text-cocoa-soft">
                  {phase.intro}
                </p>
              ) : null}
              <ol className="mt-4 space-y-4">
                {phase.steps.map((step, i) => (
                  <StepCard key={step.id} step={step} index={i + 1} activeTier={tier} />
                ))}
              </ol>
            </section>
          )
        )}
      </div>

      {/* good-to-know notes */}
      {routine.notes.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">💡 Good to know</h2>
          <div className="mt-4 space-y-4">
            {routine.notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      ) : null}

      {/* actions — explicit paywall per spec §13.1: lock + price, not vague copy */}
      <div className="mt-12 flex flex-col items-center gap-3">
        <div className="relative w-full max-w-sm">
          <button
            type="button"
            disabled
            aria-disabled="true"
            title={PREMIUM.unlockLabel}
            className="w-full cursor-not-allowed rounded-full bg-blush/50 px-8 py-4 font-display text-lg font-bold text-cocoa-soft/70"
          >
            <span aria-hidden="true" className="mr-2">🔒</span>
            Save My Routine
          </button>
          <span className="absolute -top-2.5 right-4 rounded-full bg-butter px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-cocoa shadow-card">
            🔒 {PREMIUM.unlockLabel}
          </span>
        </div>
        <p className="max-w-sm text-center text-xs font-semibold text-cocoa-soft">
          Saving routines, retake history, and more are part of premium — payments aren't live yet.
        </p>
        <button
          type="button"
          onClick={retake}
          className="w-full max-w-sm rounded-full bg-coral px-8 py-4 font-display text-lg font-bold text-cocoa shadow-soft transition hover:bg-coral-deep hover:text-cream active:scale-95"
        >
          Retake Quiz
        </button>
      </div>

      {/* free email signup (spec §12) — below the paywall, visually separate
          so it never reads as "pay to get emails" */}
      <div className="mt-12">
        <EmailSignup />
      </div>

      {/* disclaimer */}
      <footer className="mt-10 border-t border-blush/70 pt-6 text-center text-xs font-semibold leading-relaxed text-cocoa-soft">
        HairIQ gives cosmetic styling guidance, not medical treatment. Persistent scalp issues —
        anything painful, spreading, or unresponsive to over-the-counter care — deserve a
        dermatologist visit rather than a routine change.
      </footer>
    </main>
  );
}
