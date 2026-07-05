"use client";

import { useActionState, useTransition } from "react";
import {
  confirmTwoFactorAction,
  cancelTwoFactorSetupAction,
  type TwoFactorState,
} from "@/actions/two-factor";

const initialState: TwoFactorState = {};

export function TwoFactorSetupForm() {
  const [state, formAction, pending] = useActionState(confirmTwoFactorAction, initialState);
  const [cancelPending, startCancel] = useTransition();

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        name="code"
        inputMode="numeric"
        placeholder="6-digit code"
        maxLength={6}
        required
        className="input"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Verifying..." : "Turn on 2FA"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={cancelPending}
          onClick={() => startCancel(() => cancelTwoFactorSetupAction())}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
