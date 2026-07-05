"use client";

import { useActionState, useState } from "react";
import { createAnswerAction, type AnswerFormState } from "@/actions/questions";

const initialState: AnswerFormState = {};

/**
 * Step-by-step solution builder: answers are written as sequential steps
 * plus a clearly-stated final answer. Students see the steps revealed one
 * at a time (ADHD-friendly), and the steps double as the required
 * show-your-reasoning content.
 */
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
  const [steps, setSteps] = useState<string[]>([""]);

  const setStep = (i: number, value: string) =>
    setSteps((prev) => prev.map((s, idx) => (idx === i ? value : s)));
  const addStep = () => setSteps((prev) => [...prev, ""]);
  const removeStep = (i: number) =>
    setSteps((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="questionId" value={questionId} />

      <p className="text-sm font-medium">Solution steps</p>
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-3 w-14 shrink-0 text-xs font-semibold text-brand-muted">
            Step {i + 1}
          </span>
          <textarea
            name="steps"
            required={i === 0}
            rows={2}
            placeholder={i === 0 ? "Start with the first thing you'd do..." : "Then..."}
            className="input"
            value={step}
            onChange={(e) => setStep(i, e.target.value)}
          />
          {steps.length > 1 && (
            <button
              type="button"
              onClick={() => removeStep(i)}
              aria-label={`Remove step ${i + 1}`}
              className="mt-3 text-xs text-brand-muted underline"
            >
              remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addStep}
        className="self-start text-sm font-medium text-brand-teal-dark underline"
      >
        + Add step
      </button>

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
