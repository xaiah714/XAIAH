"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// All quiz state is client-side (spec v1: no accounts, no database).
// sessionStorage keeps answers across the quiz → results navigation and
// refreshes. v2 note: when accounts arrive, swap this provider's storage
// for the API and the rest of the app doesn't need to change.
const STORAGE_KEY = "hairiq-answers-v1";

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  const [answers, setAnswers] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) setAnswers(JSON.parse(raw));
    } catch {
      // ignore storage failures (private mode etc.) — quiz still works in-memory
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // ignore
    }
  }, [answers, ready]);

  const setAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const reset = useCallback(() => {
    setAnswers({});
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <QuizContext.Provider value={{ answers, setAnswer, reset, ready }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used inside <QuizProvider>");
  return ctx;
}
