"use client";

import { useActionState } from "react";
import { disableTwoFactorAction, type TwoFactorState } from "@/actions/two-factor";

const initialState: TwoFactorState = {};

export function TwoFactorDisableForm() {
  const [state, formAction, pending] = useActionState(disableTwoFactorAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm text-brand-muted" htmlFor="disable-code">
        Enter your current code to turn 2FA off
      </label>
      <input
        id="disable-code"
        name="code"
        inputMode="numeric"
        placeholder="6-digit code"
        maxLength={6}
        required
        className="input"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" className="btn-secondary self-start" disabled={pending}>
        {pending ? "Verifying..." : "Turn off 2FA"}
      </button>
    </form>
  );
}
