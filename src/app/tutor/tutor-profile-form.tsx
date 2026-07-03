"use client";

import { useActionState } from "react";
import { updateTutorProfileAction, type TutorProfileState } from "@/actions/tutor";
import { SUBJECTS } from "@/lib/subjects";

const initialState: TutorProfileState = {};

export function TutorProfileForm({
  bio,
  subjects,
}: {
  bio: string;
  subjects: string[];
}) {
  const [state, formAction, pending] = useActionState(updateTutorProfileAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SUBJECTS.filter((s) => s.value !== "OTHER").map((s) => (
          <label key={s.value} className="input flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="subjects"
              value={s.value}
              defaultChecked={subjects.includes(s.value)}
            />
            {s.label}
          </label>
        ))}
      </div>

      <textarea
        name="bio"
        defaultValue={bio}
        rows={3}
        placeholder="Short bio for your tutor profile"
        className="input"
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-brand-teal-dark">Saved.</p>}

      <button type="submit" className="btn-secondary self-start !px-4 !py-2 text-sm" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
