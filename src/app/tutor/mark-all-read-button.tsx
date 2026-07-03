"use client";

import { useTransition } from "react";
import { markAllNotificationsReadAction } from "@/actions/notifications";

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="text-sm font-medium text-brand-teal hover:underline"
      disabled={pending}
      onClick={() => startTransition(() => markAllNotificationsReadAction())}
    >
      {pending ? "Marking..." : "Mark all read"}
    </button>
  );
}
