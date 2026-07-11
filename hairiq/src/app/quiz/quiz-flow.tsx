"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, TOTAL_QUESTIONS, firstUnanswered, isComplete } from "@/lib/quiz";
import type { QuizQuestion } from "@/lib/quiz";
import { useQuiz } from "@/lib/quiz-context";
import { track } from "@/lib/analytics";

/**
 * The quiz (spec §4.2): one question per screen, progress bar at top,
 * big tappable answer cards, Back + Next nav. Q6 is multi-select with an
 * exclusive "None" option; single-select questions auto-advance shortly
 * after a tap (Back is always there to undo).
 */
export function QuizFlow() {
  const router = useRouter();
  const { answers, hydrated, setAnswer } = useQuiz();
  // null until the user navigates — the starting step is derived from stored
  // answers so a refreshed quiz resumes at the first unanswered question.
  const [stepState, setStep] = useState<number | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const step = stepState ?? (hydrated ? firstUnanswered(answers) : 0);

  useEffect(() => {
    if (hydrated) track("quiz_started");
  }, [hydrated]);

  // Move keyboard/screen-reader focus to each new question.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  if (!hydrated) {
    return <main className="min-h-dvh" aria-busy="true" />;
  }

  const question = QUESTIONS[step];
  const isLast = step === TOTAL_QUESTIONS - 1;
  const current = answers[question.key];
  const answered = question.multi
    ? Array.isArray(current) && current.length > 0
    : typeof current === "string" && current.length > 0;

  function goBack() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (step === 0) {
      router.push("/");
    } else {
      setStep(step - 1);
    }
  }

  function goNext() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (!answered) return;
    if (isLast) {
      if (isComplete(answers)) {
        track("quiz_completed");
        router.push("/results");
      } else {
        // Shouldn't happen in normal flow; recover by jumping to the gap.
        setStep(firstUnanswered(answers));
      }
    } else {
      setStep(step + 1);
    }
  }

  function select(q: QuizQuestion, value: string) {
    track("question_answered", { question: q.key });
    if (q.multi) {
      const prev = Array.isArray(answers[q.key]) ? (answers[q.key] as string[]) : [];
      let next: string[];
      if (value === q.exclusiveValue) {
        next = prev.includes(value) ? [] : [value];
      } else {
        const base = prev.filter((v) => v !== q.exclusiveValue);
        next = base.includes(value) ? base.filter((v) => v !== value) : [...base, value];
      }
      setAnswer(q.key, next);
      return;
    }

    setAnswer(q.key, value);
    // Auto-advance keeps the flow snappy; Back always allows a fix.
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (!isLast) {
      const next = Math.min(step + 1, TOTAL_QUESTIONS - 1);
      advanceTimer.current = setTimeout(() => setStep(next), 300);
    }
  }

  function isSelected(q: QuizQuestion, value: string): boolean {
    const a = answers[q.key];
    return q.multi ? Array.isArray(a) && a.includes(value) : a === value;
  }

  const progress = Math.round(((step + 1) / TOTAL_QUESTIONS) * 100);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-6 pt-6 pb-10">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-cocoa-soft">
          <span>
            Question {step + 1} of {TOTAL_QUESTIONS}
          </span>
          <span>{progress}%</span>
        </div>
        <div
          className="h-3 overflow-hidden rounded-full bg-blush"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={TOTAL_QUESTIONS}
          aria-label={`Question ${step + 1} of ${TOTAL_QUESTIONS}`}
        >
          <div
            className="h-full rounded-full bg-coral transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold outline-none sm:text-3xl"
      >
        {question.prompt}
      </h1>
      {question.help && <p className="mt-2 text-cocoa-soft">{question.help}</p>}

      {/* Answer cards */}
      <div
        role={question.multi ? "group" : "radiogroup"}
        aria-label={question.prompt}
        className="mt-6 grid flex-1 content-start gap-3"
      >
        {question.options.map((opt) => {
          const selected = isSelected(question, opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              role={question.multi ? "checkbox" : "radio"}
              aria-checked={selected}
              onClick={() => select(question, opt.value)}
              className={`flex min-h-16 items-center gap-4 rounded-bubble border-2 bg-card px-5 py-4 text-left transition active:scale-[0.99] ${
                selected
                  ? "border-coral bg-blush-soft shadow-pop"
                  : "border-line shadow-soft hover:border-blush"
              }`}
            >
              <span className="text-2xl" aria-hidden="true">
                {opt.emoji}
              </span>
              <span className="flex-1">
                <span className="block text-lg font-bold">{opt.label}</span>
                {opt.sublabel && (
                  <span className="block text-sm text-cocoa-soft">{opt.sublabel}</span>
                )}
              </span>
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold text-white transition ${
                  selected ? "border-coral bg-coral" : "border-line bg-card"
                }`}
              >
                {selected ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>

      {/* Nav */}
      <div className="mt-8 flex items-center gap-3">
        <button type="button" onClick={goBack} className="btn-secondary flex-1">
          ← Back
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!answered}
          className="btn-primary flex-[2]"
        >
          {isLast ? "See My Routine ✨" : "Next →"}
        </button>
      </div>
    </main>
  );
}
