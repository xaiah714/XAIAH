"use client";

import { useActionState, useMemo } from "react";
import { updateProfileAction, type ProfileState } from "@/actions/account";

const initialState: ProfileState = {};

const GENDERS = [
  { value: "UNSPECIFIED", label: "Prefer not to say" },
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "NONBINARY", label: "Nonbinary" },
];

export function ProfileForm({
  timezone,
  gender,
}: {
  timezone: string;
  gender: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [timezone];
    }
  }, [timezone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="timezone" className="text-sm font-medium">
          Timezone
        </label>
        <select id="timezone" name="timezone" defaultValue={timezone} className="input mt-1">
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="gender" className="text-sm font-medium">
          Gender
        </label>
        <select id="gender" name="gender" defaultValue={gender} className="input mt-1">
          {GENDERS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-brand-muted">
          Students can filter tutors by gender. This is only shown if you tutor.
        </p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-brand-teal-dark">Saved.</p>}

      <button type="submit" className="btn-secondary self-start !px-4 !py-2 text-sm" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
