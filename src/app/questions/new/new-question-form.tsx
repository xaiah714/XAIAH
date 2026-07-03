"use client";

import { useActionState, useState } from "react";
import { createQuestionAction, type QuestionFormState } from "@/actions/questions";
import { SUBJECTS } from "@/lib/subjects";

const initialState: QuestionFormState = {};

export function NewQuestionForm() {
  const [state, formAction, pending] = useActionState(createQuestionAction, initialState);
  const [subject, setSubject] = useState<string>(SUBJECTS[0].value);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="subject" className="text-sm font-medium">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          required
          className="input mt-1"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {subject === "OTHER" && (
        <div>
          <label htmlFor="subjectOther" className="text-sm font-medium">
            What subject is this?
          </label>
          <input
            id="subjectOther"
            name="subjectOther"
            required
            maxLength={100}
            placeholder="e.g. Statistics, Spanish, Accounting..."
            className="input mt-1"
          />
          <p className="mt-1 text-xs text-brand-muted">
            We track requests like this to decide what to add next.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          placeholder="e.g. Stuck on this related rates problem"
          className="input mt-1"
        />
      </div>

      <div>
        <label htmlFor="body" className="text-sm font-medium">
          What are you stuck on?
        </label>
        <textarea id="body" name="body" required rows={5} className="input mt-1" />
      </div>

      <div>
        <label htmlFor="photo" className="text-sm font-medium">
          Photo (optional)
        </label>
        <input id="photo" name="photo" type="file" accept="image/*" className="input mt-1" />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Posting..." : "Post question"}
      </button>
    </form>
  );
}
