"use client";

import { useActionState, useMemo } from "react";
import { signupAction, type SignupState } from "@/actions/auth";

const initialState: SignupState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return ["UTC"];
    }
  }, []);

  const defaultTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  }, []);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input id="name" name="name" required className="input mt-1" autoComplete="name" />
      </div>

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
          minLength={8}
          className="input mt-1"
          autoComplete="new-password"
        />
      </div>

      <div>
        <span className="text-sm font-medium">I am a...</span>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <label className="input flex cursor-pointer items-center gap-2">
            <input type="radio" name="role" value="STUDENT" defaultChecked />
            Student
          </label>
          <label className="input flex cursor-pointer items-center gap-2">
            <input type="radio" name="role" value="TUTOR" />
            Tutor
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="timezone" className="text-sm font-medium">
          Timezone
        </label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={defaultTimezone}
          className="input mt-1"
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
