"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QUESTIONS, isAnswered } from "@/lib/questions";
import { useQuiz } from "@/components/QuizProvider";
import ProgressBar from "@/components/ProgressBar";
import AnswerCard from "@/components/AnswerCard";

// One question per screen, always exactly one decision at a time (spec §3–5).
export default function QuizPage() {
  const router = useRouter();
  const { answers, setAnswer, ready } = useQuiz();
  const [idx, setIdx] = useState(0);
  const [resumed, setResumed] = useState(false);

  // Resume at the first unanswered question when coming back mid-quiz.
  useEffect(() => {
    if (!ready || resumed) return;
    const firstUnanswered = QUESTIONS.findIndex((q) => !isAnswered(answers, q));
    if (firstUnanswered > 0) setIdx(firstUnanswered);
    setResumed(true);
  }, [ready, resumed, answers]);

  if (!ready) return null;

  const question = QUESTIONS[idx];
  const value = answers[question.id];
  const answered = isAnswered(answers, question);
  const isLast = idx === QUESTIONS.length - 1;

  function choose(option) {
    if (question.multiSelect) {
      const current = Array.isArray(value) ? value : [];
      let next;
      if (option.exclusive) {
        // "None" clears everything else (and toggles itself off).
        next = current.includes(option.value) ? [] : [option.value];
      } else if (current.includes(option.value)) {
        next = current.filter((v) => v !== option.value);
      } else {
        const exclusiveValues = question.options.filter((o) => o.exclusive).map((o) => o.value);
        next = [...current.filter((v) => !exclusiveValues.includes(v)), option.value];
      }
      setAnswer(question.id, next);
    } else {
      setAnswer(question.id, option.value);
    }
  }

  function goNext() {
    if (!answered) return;
    if (isLast) router.push("/results");
    else setIdx(idx + 1);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-6 pb-10 pt-16 sm:pt-8">
      <ProgressBar current={idx + 1} total={QUESTIONS.length} />

      <div key={question.id} className="animate-rise mt-8 flex-1">
        <h1 className="font-display text-3xl font-bold leading-tight">{question.title}</h1>
        {question.subtitle ? (
          <p className="mt-2 text-base font-semibold text-cocoa-soft">{question.subtitle}</p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3" role="group" aria-label={question.title}>
          {question.options.map((option) => {
            const selected = question.multiSelect
              ? Array.isArray(value) && value.includes(option.value)
              : value === option.value;
            return (
              <AnswerCard
                key={option.value}
                option={option}
                selected={selected}
                multiSelect={question.multiSelect}
                onSelect={() => choose(option)}
              />
            );
          })}
        </div>
      </div>

      <nav className="mt-8 flex items-center gap-3">
        {idx === 0 ? (
          <Link
            href="/"
            className="rounded-full px-6 py-4 font-display text-base font-bold text-cocoa-soft transition hover:bg-blush/40"
          >
            ← Back
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setIdx(idx - 1)}
            className="rounded-full px-6 py-4 font-display text-base font-bold text-cocoa-soft transition hover:bg-blush/40"
          >
            ← Back
          </button>
        )}
        <button
          type="button"
          onClick={goNext}
          disabled={!answered}
          className={`flex-1 rounded-full px-8 py-4 font-display text-lg font-bold transition active:scale-95 ${
            answered
              ? "bg-coral text-cocoa shadow-soft hover:bg-coral-deep hover:text-cream"
              : "cursor-not-allowed bg-blush/50 text-cocoa-soft/60"
          }`}
        >
          {isLast ? "See my results ✨" : "Next"}
        </button>
      </nav>
    </main>
  );
}
