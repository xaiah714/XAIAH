"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MatchStatus } from "@prisma/client";
import { MATCH_STATUS_LABELS, MATCH_STATUS_ORDER } from "@/lib/match-status";

export default function StatusControl({
  matchId,
  status,
  confirmationUrl,
}: {
  matchId: string;
  status: MatchStatus;
  confirmationUrl: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function updateStatus(newStatus: MatchStatus) {
    setError(null);
    const formData = new FormData();
    formData.set("status", newStatus);
    const file = fileInputRef.current?.files?.[0];
    if (file) formData.set("screenshot", file);

    const res = await fetch(`/api/matches/${matchId}/status`, {
      method: "PATCH",
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't update status.");
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500">Status</label>
        <select
          className="input max-w-[220px] py-1.5 text-sm"
          value={status}
          disabled={isPending}
          onChange={(e) => updateStatus(e.target.value as MatchStatus)}
        >
          {MATCH_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {MATCH_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="text-xs"
        />
        <span>Optional confirmation screenshot</span>
      </div>
      {confirmationUrl && (
        <a
          href={confirmationUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-brand-600 hover:underline"
        >
          View saved confirmation
        </a>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
