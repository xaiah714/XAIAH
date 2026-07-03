"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentIntakeSchema, StudentIntakeInput } from "@/lib/validation";
import {
  DEMOGRAPHIC_TAG_GROUPS,
  INCOME_BRACKET_LABELS,
  SCHOOL_YEAR_LABELS,
  US_STATES,
} from "@/lib/taxonomy";

const STEPS = ["Basics", "Academics & finances", "Optional identity info", "Review"] as const;

const STEP_FIELDS: Record<number, (keyof StudentIntakeInput)[]> = {
  0: ["email", "phone", "school", "major", "year", "state"],
  1: ["gpa", "incomeBracket", "firstGen"],
  2: ["demographics"],
  3: [],
};

export default function IntakeForm({
  defaultValues,
}: {
  defaultValues?: Partial<StudentIntakeInput>;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudentIntakeInput>({
    resolver: zodResolver(studentIntakeSchema),
    defaultValues: {
      email: "",
      phone: "",
      school: "",
      major: "",
      year: null,
      gpa: null,
      state: "",
      incomeBracket: null,
      firstGen: null,
      demographics: [],
      ...defaultValues,
    },
  });

  const demographics = watch("demographics");

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: StudentIntakeInput) {
    setSubmitError(null);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setSubmitError("Something went wrong saving your profile. Please try again.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <ol className="mb-8 flex items-center gap-2 text-xs font-medium text-slate-500">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex-1 rounded-full px-2 py-1 text-center ${
              i === step
                ? "bg-brand-600 text-white"
                : i < step
                  ? "bg-brand-100 text-brand-700"
                  : "bg-slate-100"
            }`}
          >
            {label}
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 0 && (
          <fieldset className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Basics</h2>
            <Field label="Email" error={errors.email?.message}>
              <input
                type="email"
                {...register("email")}
                className="input"
                placeholder="you@school.edu"
              />
            </Field>
            <Field label="Phone (for deadline text alerts)" error={errors.phone?.message}>
              <input type="tel" {...register("phone")} className="input" placeholder="(555) 555-5555" />
            </Field>
            <Field label="School">
              <input {...register("school")} className="input" placeholder="University of..." />
            </Field>
            <Field label="Major">
              <input {...register("major")} className="input" placeholder="Computer Science" />
            </Field>
            <Field label="Year">
              <select {...register("year")} className="input">
                <option value="">Select year</option>
                {Object.entries(SCHOOL_YEAR_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="State" error={errors.state?.message}>
              <select {...register("state")} className="input">
                <option value="">Select state</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Academics & finances</h2>
            <Field label="GPA (4.0 scale)" error={errors.gpa?.message}>
              <input
                type="number"
                step="0.01"
                min={0}
                max={4}
                {...register("gpa")}
                className="input"
                placeholder="3.5"
              />
            </Field>
            <Field label="Household income bracket">
              <select {...register("incomeBracket")} className="input">
                <option value="">Prefer not to say</option>
                {Object.entries(INCOME_BRACKET_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Controller
              control={control}
              name="firstGen"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={field.value === true}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  I am a first-generation college student
                </label>
              )}
            />
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Optional identity info</h2>
              <p className="mt-1 text-sm text-slate-500">
                Every field here is optional and self-disclosed. We only use it to surface
                scholarships that consider these categories — matching more tags can unlock
                more awards.
              </p>
            </div>
            <Controller
              control={control}
              name="demographics"
              render={({ field }) => (
                <div className="space-y-5">
                  {DEMOGRAPHIC_TAG_GROUPS.map((group) => (
                    <div key={group.label}>
                      <h3 className="mb-2 text-sm font-semibold text-slate-800">{group.label}</h3>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {group.tags.map((tag) => {
                          const checked = field.value?.includes(tag.value);
                          return (
                            <label
                              key={tag.value}
                              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300"
                                checked={checked}
                                onChange={(e) => {
                                  const set = new Set(field.value ?? []);
                                  if (e.target.checked) set.add(tag.value);
                                  else set.delete(tag.value);
                                  field.onChange(Array.from(set));
                                }}
                              />
                              {tag.label}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Review</h2>
            <p className="text-sm text-slate-600">
              You selected {demographics?.length ?? 0} optional identity tag
              {demographics?.length === 1 ? "" : "s"}. Submitting will build your matches and take
              you to your dashboard.
            </p>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          </fieldset>
        )}

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="rounded-full px-5 py-2 text-sm font-medium text-slate-600 disabled:opacity-0"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "See my matches"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs font-normal text-red-600">{error}</p>}
    </label>
  );
}
