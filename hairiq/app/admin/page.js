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
  const [receiptTo, setReceiptTo] = useState("");
  const [giftTo, setGiftTo] = useState("");
  const [giftLink, setGiftLink] = useState("");
  const [giftSend, setGiftSend] = useState(true);

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
        body: JSON.stringify({
          password,
          action,
          tiers,
          subject,
          html,
          to: action === "grant-access" ? giftTo : receiptTo,
          send: giftSend,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setStatus(`⚠️ ${data.error || "Something went wrong."}`);
      } else if (action === "test-receipt") {
        setStatus(`✅ Sample purchase receipt sent to ${receiptTo}.`);
      } else if (action === "grant-access") {
        setGiftLink(data.link);
        setStatus(data.emailed ? `✅ Free access emailed to ${giftTo}.` : "✅ Link ready — copy it below.");
      } else if (action === "sync-purchases") {
        setStatus(`✅ Purchase ledger synced from Stripe: ${data.synced} recorded${data.failed ? `, ${data.failed} failed` : ""}.`);
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

      <section className="mt-10 rounded-3xl bg-white/70 p-5">
        <h2 className="font-display text-lg font-bold">Give free access 💝</h2>
        <p className="mt-1 text-sm font-semibold text-cocoa-soft">
          Gift the full paid experience — routine + all 12 Blueprint guides — to family, friends, or
          anyone you choose. Their access never expires and works on every device they open the link
          on. No payment, no code for them to remember.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="email"
            value={giftTo}
            onChange={(e) => setGiftTo(e.target.value)}
            placeholder="mom@example.com"
            className={`${input} flex-1`}
          />
          <button
            type="button"
            onClick={() => call("grant-access")}
            disabled={busy}
            className="rounded-full bg-berry px-6 py-3 font-display text-base font-bold text-white shadow-soft disabled:opacity-60"
          >
            Give access
          </button>
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-cocoa-soft">
          <input type="checkbox" checked={giftSend} onChange={(e) => setGiftSend(e.target.checked)} />
          Email them the link automatically
        </label>
        {giftLink ? (
          <div className="mt-3 rounded-2xl bg-blush/30 p-3">
            <p className="text-xs font-extrabold uppercase tracking-wide text-cocoa-soft">
              Their access link — send it however you like
            </p>
            <p className="mt-1 break-all text-xs font-semibold">{giftLink}</p>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(giftLink)}
              className="mt-2 rounded-full bg-cocoa px-4 py-2 font-display text-xs font-bold text-cream"
            >
              Copy link
            </button>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-3xl bg-white/70 p-5">
        <h2 className="font-display text-lg font-bold">Purchase receipt preview 🧾</h2>
        <p className="mt-1 text-sm font-semibold text-cocoa-soft">
          Buyers get this automatically right after paying. Send yourself a sample to check the wording and links.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="email"
            value={receiptTo}
            onChange={(e) => setReceiptTo(e.target.value)}
            placeholder="you@example.com"
            className={`${input} flex-1`}
          />
          <button
            type="button"
            onClick={() => call("test-receipt")}
            disabled={busy}
            className="rounded-full bg-cocoa px-6 py-3 font-display text-base font-bold text-cream shadow-card disabled:opacity-60"
          >
            Send sample
          </button>
        </div>
        <p className="mt-5 text-sm font-semibold text-cocoa-soft">
          Purchases are recorded in Supabase (<code>hairiq_purchases</code>) automatically. Stripe is always
          the source of truth — use this to rebuild or backfill the table any time.
        </p>
        <button
          type="button"
          onClick={() => call("sync-purchases")}
          disabled={busy}
          className="mt-2 rounded-full bg-white px-6 py-3 font-display text-base font-bold text-cocoa shadow-card disabled:opacity-60"
        >
          🔄 Sync purchases from Stripe
        </button>
      </section>
    </main>
  );
}
