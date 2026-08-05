"use client";

import { useEffect, useState } from "react";
import { fingerprint } from "@/lib/premium-auth";

// Premium unlock + saved-routine state (rev 13). A payment buys ONE exact
// set of quiz answers: unlocks are stored as answer fingerprints, so
// revisiting the same paid answers is free forever, while ANY changed
// answer means a new (unpaid) routine — closing the shared-device
// loophole. No accounts; localStorage holds the paid-fingerprint list.
const UNLOCK_KEY = "hairiq-premium-v2";
const SAVED_KEY = "hairiq-saved-v1";

function readUnlock() {
  try {
    return JSON.parse(localStorage.getItem(UNLOCK_KEY)) || {};
  } catch {
    return {};
  }
}

function readFps() {
  const v = readUnlock();
  return Array.isArray(v.fps) ? v.fps : [];
}

// Comped accounts (rev 17): the owner gifted this device permanent access,
// server-verified when the gift link was opened. No fingerprint applies —
// every routine they build stays unlocked.
function isComped() {
  return readUnlock().comp === true;
}

export function readSavedAnswers() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// `answers` = the routine currently on screen; unlocked is true only if
// THIS exact answer set has been paid for.
export function usePremium(answers) {
  const [unlocked, setUnlocked] = useState(false);
  const [fp, setFp] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const f = await fingerprint(answers || {});
        if (dead) return;
        setFp(f);
        setUnlocked(isComped() || readFps().includes(f));
        setSaved(Boolean(localStorage.getItem(SAVED_KEY)));
      } catch {}
    })();
    return () => {
      dead = true;
    };
  }, [answers]);

  function unlock(paidFp) {
    const f = paidFp || fp;
    try {
      const fps = readFps();
      if (!fps.includes(f)) fps.push(f);
      localStorage.setItem(UNLOCK_KEY, JSON.stringify({ fps }));
    } catch {}
    if (f === fp) setUnlocked(true);
  }

  function saveRoutine(a) {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(a));
    } catch {}
    setSaved(true);
  }

  return { unlocked, fp, saved, unlock, saveRoutine };
}
