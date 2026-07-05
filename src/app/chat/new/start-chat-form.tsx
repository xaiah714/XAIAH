"use client";

import { useActionState } from "react";
import { startChatSessionAction, type StartChatState } from "@/actions/chat";
import { SUBJECTS } from "@/lib/subjects";

const initialState: StartChatState = {};

export function StartChatForm() {
  const [state, formAction, pending] = useActionState(startChatSessionAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="subject" className="text-sm font-medium">
          Subject
        </label>
        <select id="subject" name="subject" required className="input mt-1">
          {SUBJECTS.filter((s) => s.value !== "OTHER").map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Connecting..." : "Find a tutor"}
      </button>
    </form>
  );
}
