"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { createQuestionAction, type QuestionFormState } from "@/actions/questions";
import { SUBJECTS, subjectLabel } from "@/lib/subjects";

const initialState: QuestionFormState = {};

type SimilarQuestion = { id: string; title: string; subject: string; status: string };

export function NewQuestionForm() {
  const [state, formAction, pending] = useActionState(createQuestionAction, initialState);
  const [subject, setSubject] = useState<string>(SUBJECTS[0].value);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [titleQuery, setTitleQuery] = useState("");
  const [similar, setSimilar] = useState<SimilarQuestion[]>([]);
  const [photoMatches, setPhotoMatches] = useState<SimilarQuestion[]>([]);
  const [photoChecking, setPhotoChecking] = useState(false);

  // Photo-to-search: when a photo is picked, ask the server whether the
  // problem is already answered (OCR seam — see src/lib/ocr.ts).
  const checkPhoto = async (file: File | undefined) => {
    setPhotoMatches([]);
    if (!file || file.size === 0) return;
    setPhotoChecking(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      const data = await res.json();
      setPhotoMatches(data.questions ?? []);
    } catch {
      // best-effort — never block asking
    } finally {
      setPhotoChecking(false);
    }
  };

  useEffect(() => {
    if (titleQuery.trim().length < 3) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/questions/search?q=${encodeURIComponent(titleQuery)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => setSimilar(data.questions ?? []))
        .catch(() => {});
    }, 400);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [titleQuery]);

  const visibleSimilar = titleQuery.trim().length >= 3 ? similar : [];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="subject" className="text-sm font-medium">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          required
          className="input mt-1"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {subject === "OTHER" && (
        <div>
          <label htmlFor="subjectOther" className="text-sm font-medium">
            What subject is this?
          </label>
          <input
            id="subjectOther"
            name="subjectOther"
            required
            maxLength={100}
            placeholder="e.g. Statistics, Spanish, Accounting..."
            className="input mt-1"
          />
          <p className="mt-1 text-xs text-brand-muted">
            We track requests like this to decide what to add next.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          placeholder="e.g. Stuck on this related rates problem"
          className="input mt-1"
          value={titleQuery}
          onChange={(e) => setTitleQuery(e.target.value)}
        />
        {visibleSimilar.length > 0 && (
          <div className="mt-2 rounded-lg border border-brand-border bg-brand-surface p-3">
            <p className="text-xs font-medium text-brand-muted">Already answered — check these first:</p>
            <ul className="mt-1 flex flex-col gap-1">
              {visibleSimilar.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/questions/${s.id}`}
                    target="_blank"
                    className="text-sm text-brand-purple-dark underline"
                  >
                    [{subjectLabel(s.subject)}] {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="body" className="text-sm font-medium">
          What are you stuck on?
        </label>
        <textarea id="body" name="body" required rows={5} className="input mt-1" />
      </div>

      <div>
        <label htmlFor="photo" className="text-sm font-medium">
          Photo (optional)
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          className="input mt-1"
          onChange={(e) => void checkPhoto(e.target.files?.[0])}
        />
        {photoChecking && (
          <p className="mt-1 text-xs text-brand-muted">
            Checking if this problem is already answered...
          </p>
        )}
        {photoMatches.length > 0 && (
          <div className="mt-2 rounded-lg border border-brand-border bg-brand-surface p-3">
            <p className="text-xs font-medium text-brand-muted">
              Your photo might already be answered — check these first:
            </p>
            <ul className="mt-1 flex flex-col gap-1">
              {photoMatches.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/questions/${s.id}`}
                    target="_blank"
                    className="text-sm text-brand-purple-dark underline"
                  >
                    [{subjectLabel(s.subject)}] {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-brand-border pt-4">
        <button
          type="button"
          onClick={() => setShowClassDetails((v) => !v)}
          className="text-sm font-medium text-brand-purple-dark"
        >
          {showClassDetails ? "− Hide" : "+ Add"} my class&apos;s method (optional)
        </button>
        {showClassDetails && (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-xs text-brand-muted">
              If your class solves this a specific way, tell us so tutors answer using your
              method instead of a technically-correct-but-different one.
            </p>
            <div>
              <label htmlFor="methodNotes" className="text-sm font-medium">
                Method / constraints
              </label>
              <textarea
                id="methodNotes"
                name="methodNotes"
                rows={2}
                placeholder="e.g. We're using u-substitution, not trig substitution"
                className="input mt-1"
              />
            </div>
            <div>
              <label htmlFor="methodPhoto" className="text-sm font-medium">
                Photo of a class example (optional)
              </label>
              <input
                id="methodPhoto"
                name="methodPhoto"
                type="file"
                accept="image/*"
                className="input mt-1"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="courseName" className="text-sm font-medium">
                  Course name
                </label>
                <input id="courseName" name="courseName" maxLength={200} className="input mt-1" />
              </div>
              <div>
                <label htmlFor="textbookName" className="text-sm font-medium">
                  Textbook
                </label>
                <input id="textbookName" name="textbookName" maxLength={200} className="input mt-1" />
              </div>
              <div>
                <label htmlFor="textbookEdition" className="text-sm font-medium">
                  Edition
                </label>
                <input
                  id="textbookEdition"
                  name="textbookEdition"
                  maxLength={50}
                  className="input mt-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="secondOpinionRequested" className="mt-1" />
        <span>
          This is tricky — route it to multiple tutors for a second opinion. We&apos;ll combine
          their verified answers into one simplified explanation once at least two come in.
        </span>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Posting..." : "Post question"}
      </button>
    </form>
  );
}
