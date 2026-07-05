"use client";

import { useTransition } from "react";
import { setTutorStatusAction } from "@/actions/admin";

const STATUSES = ["APPLIED", "TRIAL", "ACTIVE", "SUSPENDED", "REMOVED"];

export function TutorStatusActions({
  tutorId,
  currentStatus,
}: {
  tutorId: string;
  currentStatus: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.filter((s) => s !== currentStatus).map((status) => (
        <button
          key={status}
          type="button"
          className="btn-secondary !px-3 !py-1.5 text-xs"
          disabled={pending}
          onClick={() => startTransition(() => setTutorStatusAction(tutorId, status))}
        >
          Move to {status}
        </button>
      ))}
    </div>
  );
}
