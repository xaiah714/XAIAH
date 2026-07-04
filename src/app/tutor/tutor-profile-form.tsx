"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateTutorProfileAction, type TutorProfileState } from "@/actions/tutor";
import { SUBJECTS } from "@/lib/subjects";

const initialState: TutorProfileState = {};

export function TutorProfileForm({
  tutorId,
  bio,
  subjects,
  school,
  degree,
  gradYear,
  credentials,
}: {
  tutorId: string;
  bio: string;
  subjects: string[];
  school: string;
  degree: string;
  gradYear: number | null;
  credentials: string;
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
        placeholder="Short bio for your public tutor profile"
        className="input"
      />

      <p className="text-sm font-medium">
        Background{" "}
        <span className="font-normal text-brand-muted">
          (all optional — shown on your public profile as self-reported)
        </span>
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input
          name="school"
          defaultValue={school}
          maxLength={200}
          placeholder="School (e.g. UT Austin)"
          className="input"
        />
        <input
          name="degree"
          defaultValue={degree}
          maxLength={200}
          placeholder="Degree (e.g. BS Math)"
          className="input"
        />
        <input
          name="gradYear"
          type="number"
          defaultValue={gradYear ?? ""}
          min={1950}
          max={new Date().getFullYear() + 10}
          placeholder="Grad year"
          className="input"
        />
      </div>
      <textarea
        name="credentials"
        defaultValue={credentials}
        rows={2}
        maxLength={2000}
        placeholder="Credentials & background (e.g. 3 years tutoring calculus, TA for intro physics)"
        className="input"
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-brand-teal-dark">
          Saved.{" "}
          <Link href={`/tutors/${tutorId}`} className="underline">
            View your public profile
          </Link>
        </p>
      )}

      <button type="submit" className="btn-secondary self-start !px-4 !py-2 text-sm" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
