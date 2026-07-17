"use client";

import { useEffect, useState } from "react";
import { readSavedAnswers } from "@/components/usePremium";

// Landing-page link to a premium-saved routine (rev 7). Copies the saved
// answers into the session store and does a full navigation so the results
// screen picks them up exactly like a fresh quiz run.
export default function SavedRoutineLink() {
  const [exists, setExists] = useState(false);

  useEffect(() => {
    setExists(Boolean(readSavedAnswers()));
  }, []);

  if (!exists) return null;

  function open(e) {
    e.preventDefault();
    const answers = readSavedAnswers();
    if (!answers) return;
    try {
      sessionStorage.setItem("hairiq-answers-v1", JSON.stringify(answers));
    } catch {}
    window.location.href = "/results";
  }

  return (
    <a
      href="/results"
      onClick={open}
      className="mt-6 inline-flex min-h-11 items-center rounded-full bg-white/80 px-6 py-2.5 font-display text-sm font-bold text-cocoa shadow-card transition hover:bg-white active:scale-95"
    >
      💾 View my saved routine →
    </a>
  );
}
