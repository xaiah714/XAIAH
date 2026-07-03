"use client";

import { useTransition } from "react";
import { markQuestionResolvedAction } from "@/actions/questions";

export function ResolveButton({ questionId }: { questionId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn-secondary !px-4 !py-2 text-sm"
      disabled={pending}
      onClick={() => startTransition(() => markQuestionResolvedAction(questionId))}
    >
      {pending ? "Marking resolved..." : "Mark as resolved"}
    </button>
  );
}
