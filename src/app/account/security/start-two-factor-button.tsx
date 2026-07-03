"use client";

import { useTransition } from "react";
import { startTwoFactorSetupAction } from "@/actions/two-factor";

export function StartTwoFactorButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn-primary"
      disabled={pending}
      onClick={() => startTransition(() => startTwoFactorSetupAction())}
    >
      {pending ? "Starting..." : "Set up 2FA"}
    </button>
  );
}
