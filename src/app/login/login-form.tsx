"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

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
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
