"use client";

import { useTransition } from "react";
import { claimChatSessionAction } from "@/actions/chat";

export function ClaimButton({ chatSessionId }: { chatSessionId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn-primary !px-4 !py-2 text-sm"
      disabled={pending}
      onClick={() => startTransition(() => claimChatSessionAction(chatSessionId))}
    >
      {pending ? "Claiming..." : "Claim"}
    </button>
  );
}
