"use client";

import { useTransition } from "react";
import { toggleAvailabilityAction } from "@/actions/tutor";

export function AvailabilityToggle({ available }: { available: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={available ? "btn-primary !px-4 !py-2 text-sm" : "btn-secondary !px-4 !py-2 text-sm"}
      disabled={pending}
      onClick={() => startTransition(() => toggleAvailabilityAction())}
    >
      {available ? "You're available — go offline" : "Go available for live chat"}
    </button>
  );
}
