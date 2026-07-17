"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isQuizComplete } from "@/lib/questions";
import { buildRoutine } from "@/lib/recommendations";
import { PREMIUM } from "@/lib/config";
import { useQuiz } from "@/components/QuizProvider";
import { usePremium } from "@/components/usePremium";
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
  // One phase visible at a time (rev 6): kills the endless-scroll feel and
  // matches the one-thing-per-screen rule. "tips" holds the Good-to-know notes.
  const [phase, setPhase] = useState("washDay");
  useEffect(() => {
    if (routine && tier === null) setTier(routine.defaultTier);
  }, [routine, tier]);

  // Premium (rev 7): Stripe Checkout → success redirect lands back here with
  // a session_id; verify it server-side before unlocking on this device.
  const { unlocked, saved, unlock, saveRoutine } = usePremium();
  const [payState, setPayState] = useState("idle"); // idle | starting | unavailable | error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("checkout")) return;
    const sessionId = params.get("session_id");
    window.history.replaceState(null, "", "/results"); // clean URL either way
    if (params.get("checkout") === "success" && sessionId) {
      fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.paid) unlock();
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCheckout() {
    setPayState("starting");
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setPayState(res.status === 503 ? "unavailable" : "error");
    } catch {
      setPayState("error");
    }
  }

  if (!routine || tier === null) return null;

  const phaseTabs = [
    ...routine.phases.map((p) => ({ id: p.id, title: p.title, emoji: p.emoji })),
    { id: "tips", title: "Tips", emoji: "💡" },
  ];
  const activePhase = routine.phases.find((p) => p.id === phase) || null;

  function retake() {
    reset();
    router.push("/quiz");
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pb-16 pt-16 sm:pt-10">
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
              className="rounded-full bg-butter px-3.5 py-1.5 text-xs font-extrabold text-cocoa shadow-card"
            >
              {chip}
            </li>
          ))}
        </ul>
      </header>

      {/* tier tabs (pre-calculated) + phase tabs, one sticky block */}
      <div className="sticky top-0 z-10 -mx-6 mt-8 bg-cream/95 px-6 py-3 backdrop-blur-sm">
        <TierTabs activeTier={tier} onChange={setTier} />
        <div
          role="tablist"
          aria-label="Routine section"
          className="mt-2.5 flex w-full gap-1.5"
        >
          {phaseTabs.map((pt) => {
            const active = pt.id === phase;
            return (
              <button
                key={pt.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setPhase(pt.id)}
                className={`min-h-11 flex-1 whitespace-nowrap rounded-full px-1 py-2 font-display text-[13px] font-bold leading-tight transition active:scale-95 sm:text-sm ${
                  active
                    ? "bg-cocoa text-cream shadow-card"
                    : "bg-white/80 text-cocoa-soft hover:bg-blush/40"
                }`}
              >
                <span aria-hidden="true" className="hidden sm:inline">
                  {pt.emoji}{" "}
                </span>
                {pt.title}
              </button>
            );
          })}
        </div>
      </div>
      {tier === "crueltyFree" ? (
        <p className="mt-3 text-center text-xs font-semibold text-cocoa-soft">
          🐰 Certified or independently tracked cruelty-free — across every price point.
          Certifications can change; verify via Leaping Bunny or PETA before you buy.
        </p>
      ) : null}

      {/* one routine section at a time — Wash Day / Daily / At Night / Tips */}
      <div className="mt-6">
        {activePhase ? (
          <section key={activePhase.id} className="animate-rise">
            <h2 className="font-display text-2xl font-bold">
              <span aria-hidden="true" className="mr-2">
                {activePhase.emoji}
              </span>
              {activePhase.title}
            </h2>
            {activePhase.intro ? (
              <p className="mt-2 text-sm font-semibold leading-relaxed text-cocoa-soft">
                {activePhase.intro}
              </p>
            ) : null}
            <ol className="mt-4 space-y-4">
              {activePhase.steps.map((step, i) => (
                <StepCard key={step.id} step={step} index={i + 1} activeTier={tier} />
              ))}
            </ol>
          </section>
        ) : (
          <section key="tips" className="animate-rise">
            <h2 className="font-display text-2xl font-bold">💡 Good to know</h2>
            <div className="mt-4 space-y-4">
              {routine.notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* actions — explicit paywall per spec §13.1: lock + price. One click →
          Stripe's hosted checkout (card / Apple Pay / Google Pay) → back here
          with a verified session → unlocked. */}
      <div className="mt-12 flex flex-col items-center gap-3">
        {unlocked ? (
          <>
            <button
              type="button"
              onClick={() => saveRoutine(answers)}
              disabled={saved}
              className={`w-full max-w-sm rounded-full px-8 py-4 font-display text-lg font-bold transition active:scale-95 ${
                saved
                  ? "cursor-default bg-butter text-cocoa"
                  : "bg-coral text-cocoa shadow-soft hover:bg-coral-deep hover:text-cream"
              }`}
            >
              {saved ? "Saved ✓" : "💾 Save My Routine"}
            </button>
            <p className="max-w-sm text-center text-xs font-semibold text-cocoa-soft">
              {saved
                ? "Your routine lives on the home screen now — retake the quiz any time without losing it."
                : "Premium unlocked on this device ✨ Save your routine to reach it from the home screen."}
            </p>
          </>
        ) : (
          <>
            <div className="relative w-full max-w-sm">
              <button
                type="button"
                onClick={startCheckout}
                disabled={payState === "starting"}
                title={PREMIUM.unlockLabel}
                className="w-full rounded-full bg-blush/60 px-8 py-4 font-display text-lg font-bold text-cocoa shadow-card transition hover:bg-blush active:scale-95 disabled:cursor-wait disabled:opacity-70"
              >
                <span aria-hidden="true" className="mr-2">🔒</span>
                {payState === "starting" ? "Opening secure checkout…" : "Save My Routine"}
              </button>
              <span className="absolute -top-2.5 right-4 rounded-full bg-butter px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-cocoa shadow-card">
                🔒 {PREMIUM.unlockLabel}
              </span>
            </div>
            <p className="max-w-sm text-center text-xs font-semibold text-cocoa-soft">
              {payState === "unavailable"
                ? "Payments are almost live — check back very soon!"
                : payState === "error"
                  ? "Couldn't start checkout — give it another try in a moment."
                  : `One-time ${PREMIUM.priceLabel} · secure Stripe checkout · card, Apple Pay, or Google Pay.`}
            </p>
          </>
        )}
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
        How Is My Hair gives cosmetic styling guidance, not medical treatment. Persistent scalp issues —
        anything painful, spreading, or unresponsive to over-the-counter care — deserve a
        dermatologist visit rather than a routine change.
      </footer>
    </main>
  );
}
