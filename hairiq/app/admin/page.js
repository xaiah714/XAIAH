"use client";

import { useState } from "react";
import { NEWSLETTER_TIERS } from "@/lib/config";

// Internal newsletter console (rev 11). Not linked from anywhere on the
// site; every action requires the ADMIN_PASSWORD secret, verified
// server-side in /api/newsletter. Paste the week's content, pick the
// segment(s), preview the audience size, send.
export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [tiers, setTiers] = useState(NEWSLETTER_TIERS.map((t) => t.value));
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function toggle(value) {
    setTiers((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]));
  }

  async function call(action) {
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action, tiers, subject, html }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setStatus(`⚠️ ${data.error || "Something went wrong."}`);
      } else if (action === "preview") {
        setStatus(`👀 This would go to ${data.recipients} subscriber${data.recipients === 1 ? "" : "s"}.`);
      } else {
        setStatus(
          `✅ Sent to ${data.sent} subscriber${data.sent === 1 ? "" : "s"}.` +
            (data.failedCount ? ` ⚠️ ${data.failedCount} failed — check server logs.` : "")
        );
      }
    } catch {
      setStatus("⚠️ Couldn't reach the server.");
    }
    setBusy(false);
  }

  function send() {
    if (!window.confirm(`Really send "${subject || "(no subject)"}" to the selected segment(s)?`)) return;
    call("send");
  }

  const input =
    "w-full rounded-2xl border-2 border-blush-deep/40 bg-white px-4 py-3 text-sm font-semibold placeholder:text-cocoa-soft/60 focus:border-berry focus:outline-none";

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pb-16 pt-16 sm:pt-10">
      <h1 className="font-display text-3xl font-bold">Newsletter console 💌</h1>
      <p className="mt-2 text-sm font-semibold text-cocoa-soft">
        Internal page — paste this week&rsquo;s content, pick who gets it, preview the count, send.
        Subscribers only receive segments they picked at signup.
      </p>

      <div className="mt-6 space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className={input}
        />
        <div className="flex flex-wrap gap-2">
          {NEWSLETTER_TIERS.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={tiers.includes(t.value)}
              onClick={() => toggle(t.value)}
              className={`min-h-11 rounded-full border-2 px-4 py-2 font-display text-sm font-bold transition ${
                tiers.includes(t.value)
                  ? "border-berry bg-berry text-white"
                  : "border-blush-deep/40 bg-white text-cocoa-soft"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject line"
          className={input}
        />
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          placeholder="This week's content — plain text with <p>, <b>, <a href=…> HTML welcome. It gets wrapped in the brand header/footer automatically."
          rows={12}
          className={input}
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => call("preview")}
            disabled={busy}
            className="rounded-full bg-white px-6 py-3 font-display text-base font-bold text-cocoa shadow-card transition hover:bg-blush/40 disabled:opacity-60"
          >
            Preview audience
          </button>
          <button
            type="button"
            onClick={send}
            disabled={busy}
            className="rounded-full bg-berry px-8 py-3 font-display text-base font-bold text-white shadow-soft transition hover:bg-blush-deep disabled:opacity-60"
          >
            {busy ? "Working…" : "Send now"}
          </button>
        </div>
        {status ? <p className="text-sm font-bold">{status}</p> : null}
      </div>
    </main>
  );
}
