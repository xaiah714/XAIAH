"use client";

import { useActionState } from "react";
import { createAnswerAction, type AnswerFormState } from "@/actions/questions";

const initialState: AnswerFormState = {};

export function AnswerForm({ questionId }: { questionId: string }) {
  const [state, formAction, pending] = useActionState(createAnswerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="questionId" value={questionId} />
      <textarea
        name="body"
        required
        rows={4}
        placeholder="Walk them through it..."
        className="input"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" className="btn-primary self-start" disabled={pending}>
        {pending ? "Posting..." : "Post answer"}
      </button>
    </form>
  );
}
