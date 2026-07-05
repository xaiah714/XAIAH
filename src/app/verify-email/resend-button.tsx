"use client";

import { useActionState } from "react";
import { resendVerificationEmailAction, type ResendState } from "@/actions/verify-email";

const initialState: ResendState = {};

export function ResendButton() {
  const [state, formAction, pending] = useActionState(resendVerificationEmailAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-center gap-2">
      <button type="submit" className="btn-secondary" disabled={pending}>
        {pending ? "Sending..." : "Resend verification email"}
      </button>
      {state.sent && <p className="text-sm text-brand-teal-dark">Sent — check your inbox.</p>}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
