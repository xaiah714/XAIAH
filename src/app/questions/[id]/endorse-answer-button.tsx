"use client";

import { useActionState } from "react";
import { endorseAnswerAction, type EndorseFormState } from "@/actions/questions";

const initialState: EndorseFormState = {};

export function EndorseAnswerButton({
  answerId,
  alreadyEndorsed,
}: {
  answerId: string;
  alreadyEndorsed: boolean;
}) {
  const [state, formAction, pending] = useActionState(endorseAnswerAction, initialState);

  if (alreadyEndorsed) {
    return <span className="text-xs text-brand-teal-dark">✓ You back this answer</span>;
  }

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="answerId" value={answerId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-brand-teal-dark underline disabled:opacity-50"
      >
        {pending ? "Backing..." : "Agree — this answer is correct"}
      </button>
      {state.error && <span className="ml-2 text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
