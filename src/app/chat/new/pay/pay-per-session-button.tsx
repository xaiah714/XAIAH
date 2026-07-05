"use client";

import { useActionState } from "react";
import { createPayPerSessionCheckoutAction } from "@/actions/payments";

const initialState: { error?: string } = {};

export function PayPerSessionButton({ subject }: { subject: string }) {
  const [state, formAction, pending] = useActionState(
    createPayPerSessionCheckoutAction,
    initialState
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="subject" value={subject} />
      {state.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
      <button type="submit" className="btn-secondary" disabled={pending}>
        {pending ? "Redirecting..." : "Pay ~$3 for this session"}
      </button>
    </form>
  );
}
