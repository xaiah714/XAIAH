"use client";

import { useActionState, useState } from "react";
import { bulkLoadSeedQuestionsAction, type SeedLoadState } from "@/actions/admin";

const initialState: SeedLoadState = {};

export function SeedLoadForm() {
  const [state, formAction, pending] = useActionState(bulkLoadSeedQuestionsAction, initialState);
  const [lines, setLines] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="lines"
        rows={8}
        required
        placeholder={"MATH | Solve 2x+6=14 | Show each step clearly. | | Algebra 1\nPSYCHOLOGY | Classical vs operant conditioning | Explain the difference with examples."}
        className="input font-mono !text-xs"
        value={lines}
        onChange={(e) => setLines(e.target.value)}
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.loaded !== undefined && (
        <p className="text-sm text-brand-teal-dark">
          Loaded {state.loaded} question{state.loaded === 1 ? "" : "s"}.
          {state.skipped && state.skipped.length > 0 && (
            <span className="text-red-600">
              {" "}
              Skipped {state.skipped.length} malformed line
              {state.skipped.length === 1 ? "" : "s"}: {state.skipped.join(" · ")}
            </span>
          )}
        </p>
      )}
      <button type="submit" className="btn-primary self-start" disabled={pending}>
        {pending ? "Loading..." : "Load into queue"}
      </button>
    </form>
  );
}
