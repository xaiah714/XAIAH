"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationStepType } from "@prisma/client";

export type WalkthroughStep = {
  id: string;
  type: ApplicationStepType;
  label: string;
  completed: boolean;
  order: number;
};

const ENCOURAGEMENTS = [
  "Nice — one down.",
  "That's momentum. Keep going.",
  "You're closer than you think.",
  "Small step, real progress.",
  "Look at you go.",
];

export default function WalkthroughSteps({
  matchId,
  steps,
}: {
  matchId: string;
  steps: WalkthroughStep[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(steps);
  const [celebrating, setCelebrating] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const completedCount = items.filter((s) => s.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  async function toggle(step: WalkthroughStep) {
    const nextCompleted = !step.completed;
    setPendingId(step.id);
    setItems((prev) => prev.map((s) => (s.id === step.id ? { ...s, completed: nextCompleted } : s)));

    const res = await fetch(`/api/matches/${matchId}/steps/${step.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: nextCompleted }),
    });

    setPendingId(null);

    if (!res.ok) {
      // Revert on failure.
      setItems((prev) => prev.map((s) => (s.id === step.id ? { ...s, completed: step.completed } : s)));
      return;
    }

    if (nextCompleted) {
      const message = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
      setCelebrating(message);
      setTimeout(() => setCelebrating(null), 2200);
    }

    if (step.type === "SUBMIT" && nextCompleted) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-sm text-slate-600">
          <span>
            {completedCount} of {items.length} steps done
          </span>
          <span className="font-medium text-brand-700">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2.5">
        {items.map((step) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => toggle(step)}
              disabled={pendingId === step.id}
              className={`flex min-h-[56px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                step.completed
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-brand-300"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-transform ${
                  step.completed
                    ? "scale-110 border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 text-transparent"
                }`}
              >
                ✓
              </span>
              <span
                className={`text-sm ${step.completed ? "text-emerald-800 line-through decoration-emerald-400" : "text-slate-800"}`}
              >
                {step.label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div
        aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-brand-950 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 ${
          celebrating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {celebrating}
      </div>
    </div>
  );
}
