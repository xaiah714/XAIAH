"use client";

import { useActionState } from "react";
import { createAnswerAction, type AnswerFormState } from "@/actions/questions";

const initialState: AnswerFormState = {};

export function AnswerForm({
  questionId,
  requireStance = false,
  disputeOpen = false,
}: {
  questionId: string;
  requireStance?: boolean;
  disputeOpen?: boolean;
}) {
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

      {requireStance && (
        <fieldset className="rounded-xl border border-brand-border p-3">
          <legend className="px-1 text-sm font-medium">
            This question already has a verified answer — where do you land?
          </legend>
          <label className="flex items-start gap-2 text-sm">
            <input type="radio" name="stance" value="agree" required className="mt-1" />
            <span>My answer agrees with the verified answer(s) above</span>
          </label>
          <label className="mt-2 flex items-start gap-2 text-sm">
            <input type="radio" name="stance" value="disagree" required className="mt-1" />
            <span>
              My answer disagrees — this opens a review by every tutor in this subject
            </span>
          </label>
        </fieldset>
      )}

      {disputeOpen && (
        <p className="text-xs text-brand-muted">
          This question is under dispute review. If one of the existing answers is right,
          back it with the &ldquo;Agree&rdquo; button above instead of rewriting it — post a new
          answer only if you believe both sides got it wrong.
        </p>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" className="btn-primary self-start" disabled={pending}>
        {pending ? "Posting..." : "Post answer"}
      </button>
    </form>
  );
}
