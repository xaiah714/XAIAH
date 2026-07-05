"use client";

import { useActionState, useState } from "react";
import { flagAnswerAction, type FlagAnswerFormState } from "@/actions/questions";

const initialState: FlagAnswerFormState = {};

export function FlagAnswerButton({ answerId }: { answerId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(flagAnswerAction, initialState);

  if (state.success) {
    return <span className="text-xs text-brand-muted">Flagged for review</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-brand-muted underline"
      >
        Flag as incomplete/incorrect
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="answerId" value={answerId} />
      <textarea
        name="reason"
        rows={2}
        maxLength={500}
        placeholder="What's wrong with this answer? (optional)"
        className="input text-xs"
      />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-secondary !px-3 !py-1 text-xs" disabled={pending}>
          {pending ? "Submitting..." : "Submit flag"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-brand-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
