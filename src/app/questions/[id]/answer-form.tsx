"use client";

import { useActionState } from "react";
import { createAnswerAction, type AnswerFormState } from "@/actions/questions";

const initialState: AnswerFormState = {};

export function AnswerForm({ questionId }: { questionId: string }) {
  const [state, formAction, pending] = useActionState(createAnswerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="questionId" value={questionId} />
      <div>
        <label htmlFor="reasoning" className="text-sm font-medium">
          Show your steps/reasoning first
        </label>
        <textarea
          id="reasoning"
          name="reasoning"
          required
          rows={4}
          placeholder="Walk through how you got there..."
          className="input mt-1"
        />
      </div>
      <div>
        <label htmlFor="body" className="text-sm font-medium">
          Final answer
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={2}
          placeholder="The final answer, clearly stated"
          className="input mt-1"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" className="btn-primary self-start" disabled={pending}>
        {pending ? "Posting..." : "Post answer"}
      </button>
    </form>
  );
}
