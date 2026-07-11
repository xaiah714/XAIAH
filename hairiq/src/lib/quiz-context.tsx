"use client";

/**
 * Client-side quiz state (v1 has no backend — spec §1).
 * sessionStorage is the backing store (so a refresh mid-quiz or on the
 * results page doesn't lose progress), exposed to React through
 * useSyncExternalStore: the server/hydration snapshot is null, and the real
 * answers appear right after mount — no hydration mismatch, no effects.
 *
 * v2 note: when accounts land, swap the sessionStorage read/write below for
 * server calls without touching any component.
 */

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import type { Answers, QuestionKey } from "./quiz";

const STORAGE_KEY = "hairiq.quiz.v1";
const EMPTY: Answers = {};

const listeners = new Set<() => void>();
let initialized = false;
let cachedAnswers: Answers = EMPTY;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Answers {
  if (!initialized) {
    initialized = true;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      cachedAnswers = parsed && typeof parsed === "object" ? (parsed as Answers) : EMPTY;
    } catch {
      cachedAnswers = EMPTY;
    }
  }
  return cachedAnswers;
}

// Stable null on the server and during hydration; flips to the stored
// answers immediately after mount.
function getServerSnapshot(): Answers | null {
  return null;
}

function write(next: Answers): void {
  cachedAnswers = next;
  initialized = true;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full/unavailable — the in-memory copy still works.
  }
  listeners.forEach((l) => l());
}

interface QuizContextValue {
  answers: Answers;
  /** False during SSR/hydration, true once client state is live. */
  hydrated: boolean;
  setAnswer: (key: QuestionKey, value: string | string[]) => void;
  reset: () => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setAnswer = useCallback((key: QuestionKey, value: string | string[]) => {
    write({ ...getSnapshot(), [key]: value });
  }, []);

  const reset = useCallback(() => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    write(EMPTY);
  }, []);

  const value = useMemo(
    () => ({
      answers: snapshot ?? EMPTY,
      hydrated: snapshot !== null,
      setAnswer,
      reset,
    }),
    [snapshot, setAnswer, reset],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used inside <QuizProvider>");
  return ctx;
}
