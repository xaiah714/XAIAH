"use client";

import { useActionState, useState } from "react";
import { submitRatingAction, type RateSessionState } from "@/actions/tips";

const initialState: RateSessionState = {};
const TIP_OPTIONS = [0, 200, 500, 1000];

export function RateForm({ chatSessionId }: { chatSessionId: string }) {
  const [state, formAction, pending] = useActionState(submitRatingAction, initialState);
  const [stars, setStars] = useState(5);
  const [tipCents, setTipCents] = useState(0);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="chatSessionId" value={chatSessionId} />
      <input type="hidden" name="stars" value={stars} />
      <input type="hidden" name="tipCents" value={tipCents} />

      <div>
        <span className="text-sm font-medium">Rating</span>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              className={`text-2xl ${n <= stars ? "text-brand-teal" : "text-brand-border"}`}
              aria-label={`${n} stars`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="text-sm font-medium">
          Comment (optional)
        </label>
        <textarea id="comment" name="comment" rows={3} className="input mt-1" />
      </div>

      <div>
        <span className="text-sm font-medium">Tip your tutor (optional)</span>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {TIP_OPTIONS.map((cents) => (
            <button
              key={cents}
              type="button"
              onClick={() => setTipCents(cents)}
              className={`btn-secondary !px-2 !py-2 text-sm ${tipCents === cents ? "ring-2 ring-brand-teal" : ""}`}
            >
              {cents === 0 ? "No tip" : `$${cents / 100}`}
            </button>
          ))}
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Submitting..." : tipCents > 0 ? "Submit & pay tip" : "Submit rating"}
      </button>
    </form>
  );
}
