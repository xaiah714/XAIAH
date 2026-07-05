"use client";

import { useActionState, useMemo, useState } from "react";
import { signupAction, type SignupState } from "@/actions/auth";
import { GRADE_LEVELS } from "@/lib/grade-levels";
import { SUBJECTS } from "@/lib/subjects";

const initialState: SignupState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);
  const [role, setRole] = useState<"STUDENT" | "TUTOR">("STUDENT");
  const [otherSubject, setOtherSubject] = useState(false);
  // Controlled inputs: React 19 resets uncontrolled fields after a server
  // action returns (e.g. a rejected email), which would silently wipe the
  // rest of the form on a validation error.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subjectOther, setSubjectOther] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [timezone, setTimezone] = useState("");

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
        <input
          id="name"
          name="name"
          required
          className="input mt-1"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          minLength={8}
          className="input mt-1"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          <select
            id="gradeLevel"
            name="gradeLevel"
            required
            className="input mt-1"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
          >
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
                <input
                  type="checkbox"
                  name="studentSubjects"
                  value={s.value}
                  checked={subjects.includes(s.value)}
                  onChange={(e) =>
                    setSubjects((prev) =>
                      e.target.checked ? [...prev, s.value] : prev.filter((v) => v !== s.value)
                    )
                  }
                />
                {s.label}
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="studentSubjects"
                value="OTHER"
                checked={otherSubject}
                onChange={(e) => setOtherSubject(e.target.checked)}
              />
              Other
            </label>
          </div>
          {otherSubject && (
            <input
              name="studentSubjectOther"
              required
              maxLength={100}
              placeholder="What subject? (e.g. Statistics, Spanish, Economics)"
              className="input mt-2"
              value={subjectOther}
              onChange={(e) => setSubjectOther(e.target.value)}
            />
          )}
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
          className="input mt-1"
          value={timezone || defaultTimezone}
          onChange={(e) => setTimezone(e.target.value)}
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
