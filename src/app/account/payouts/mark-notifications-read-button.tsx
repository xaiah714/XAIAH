"use client";

import { useTransition } from "react";
import { markPayoutNotificationsReadAction } from "@/actions/notifications";

export function MarkPayoutNotificationsReadButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="text-sm font-medium text-brand-teal hover:underline"
      disabled={pending}
      onClick={() => startTransition(() => markPayoutNotificationsReadAction())}
    >
      {pending ? "Marking..." : "Mark all read"}
    </button>
  );
}
