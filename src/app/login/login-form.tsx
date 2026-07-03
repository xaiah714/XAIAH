"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  // Controlled inputs: React 19 resets uncontrolled form fields after a
  // server action runs even without a redirect, which would otherwise wipe
  // email/password between the password step and the 2FA code step.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input mt-1"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="input mt-1"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {state.requireCode && (
        <div>
          <label htmlFor="code" className="text-sm font-medium">
            2FA code
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit code from your app"
            required
            autoFocus
            className="input mt-1"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Logging in..." : state.requireCode ? "Verify code" : "Log in"}
      </button>
    </form>
  );
}
