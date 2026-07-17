"use client";

import { useEffect, useState } from "react";

// Premium unlock + saved-routine state (rev 7). No accounts yet (§13 v2),
// so both live in localStorage — the unlock is per device/browser until
// accounts arrive; then this hook swaps its storage for an API without
// touching the screens that use it.
const UNLOCK_KEY = "hairiq-premium-v1";
const SAVED_KEY = "hairiq-saved-v1";

export function readSavedAnswers() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function usePremium() {
  const [unlocked, setUnlocked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      setUnlocked(Boolean(localStorage.getItem(UNLOCK_KEY)));
      setSaved(Boolean(localStorage.getItem(SAVED_KEY)));
    } catch {
      // storage blocked — stay locked
    }
  }, []);

  function unlock() {
    try {
      localStorage.setItem(UNLOCK_KEY, JSON.stringify({ unlocked: true, at: Date.now() }));
    } catch {}
    setUnlocked(true);
  }

  function saveRoutine(answers) {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(answers));
    } catch {}
    setSaved(true);
  }

  return { unlocked, saved, unlock, saveRoutine };
}
