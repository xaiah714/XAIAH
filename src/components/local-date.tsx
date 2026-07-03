"use client";

import { useEffect, useState } from "react";

/** Formats a UTC ISO date string in the browser's own local timezone. No manual timezone selector — this is always auto-detected. */
export function LocalDate({ iso, className }: { iso: string; className?: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(
      new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(
        new Date(iso),
      ),
    );
  }, [iso]);

  return <span className={className}>{text ?? "…"}</span>;
}

export function LocalDeadline({ iso }: { iso: string }) {
  const [state, setState] = useState<{ text: string; daysLeft: number } | null>(null);

  useEffect(() => {
    const date = new Date(iso);
    const text = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
    const daysLeft = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    setState({ text, daysLeft });
  }, [iso]);

  if (!state) {
    return <span className="text-slate-400">Loading deadline…</span>;
  }

  const urgent = state.daysLeft <= 14 && state.daysLeft >= 0;
  return (
    <span className={urgent ? "font-semibold text-coral-600" : "text-slate-600"}>
      Due {state.text}
      {state.daysLeft >= 0 ? ` (${state.daysLeft}d left)` : " (passed)"}
    </span>
  );
}
