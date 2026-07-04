"use client";

import { useActionState, useMemo, useState } from "react";
import { signupAction, type SignupState } from "@/actions/auth";
import { GRADE_LEVELS } from "@/lib/grade-levels";
import { SUBJECTS } from "@/lib/subjects";

const initialState: SignupState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);
  const [role, setRole] = useState<"STUDENT" | "TUTOR">("STUDENT");

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
            <input
              type="radio"
              name="role"
              value="STUDENT"
              checked={role === "STUDENT"}
              onChange={() => setRole("STUDENT")}
            />
            Student
          </label>
          <label className="input flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="role"
              value="TUTOR"
              checked={role === "TUTOR"}
              onChange={() => setRole("TUTOR")}
            />
            Tutor
          </label>
        </div>
      </div>

      {role === "STUDENT" && (
        <div>
          <label htmlFor="gradeLevel" className="text-sm font-medium">
            Grade level
          </label>
          <select id="gradeLevel" name="gradeLevel" required className="input mt-1" defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            {GRADE_LEVELS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-brand-muted">
            Shown to tutors instead of your name before they claim your request.
          </p>
        </div>
      )}

      {role === "STUDENT" && (
        <div>
          <span className="text-sm font-medium">What do you need help with? (optional)</span>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {SUBJECTS.filter((s) => s.value !== "OTHER").map((s) => (
              <label key={s.value} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="studentSubjects" value={s.value} />
                {s.label}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-brand-muted">
            Verified tutors in these subjects get a heads-up that you&apos;ve joined.
          </p>
        </div>
      )}

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
