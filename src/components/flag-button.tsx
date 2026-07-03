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
        className="text-xs font-medium text-slate-400 hover:text-red-600"
      >
        Report as suspicious
      </button>
    );
  }

  if (status === "sent") {
    return <p className="text-xs text-slate-500">Thanks — this listing will be reviewed.</p>;
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50 p-3">
      <label className="text-xs font-medium text-red-700">
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
          className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {status === "sending" ? "Sending..." : "Submit report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-slate-500 hover:underline"
        >
          Cancel
        </button>
      </div>
      {status === "error" && <p className="text-xs text-red-700">Couldn&apos;t send — try again.</p>}
    </div>
  );
}
