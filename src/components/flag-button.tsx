"use client";

import { useState } from "react";

export default function FlagButton({ scholarshipId }: { scholarshipId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit() {
    if (reason.trim().length < 3) return;
    setStatus("sending");
    const res = await fetch(`/api/scholarships/${scholarshipId}/flag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[44px] px-1 text-xs font-medium text-slate-400 hover:text-coral-600"
      >
        Report as suspicious
      </button>
    );
  }

  if (status === "sent") {
    return <p className="text-xs text-slate-500">Thanks — this listing will be reviewed.</p>;
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-coral-100 bg-coral-50 p-3">
      <label className="text-xs font-medium text-coral-700">
        What looks wrong about this listing?
      </label>
      <textarea
        className="input text-sm"
        rows={2}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. asks for payment, broken/suspicious link, fake org..."
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={status === "sending"}
          className="min-h-[40px] rounded-full bg-coral-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-coral-600 disabled:opacity-60"
        >
          {status === "sending" ? "Sending..." : "Submit report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-[40px] px-2 text-xs text-slate-500 hover:underline"
        >
          Cancel
        </button>
      </div>
      {status === "error" && <p className="text-xs text-coral-700">Couldn&apos;t send — try again.</p>}
    </div>
  );
}
