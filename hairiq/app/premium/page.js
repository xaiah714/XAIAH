"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PREMIUM } from "@/lib/config";
import { buildProfile, buildPremiumTabs } from "@/lib/premium-content";
import Tracker from "@/components/Tracker";

function readAnswers() {
  // personalization source: current quiz session, else the saved routine
  try {
    const s = sessionStorage.getItem("hairiq-answers-v1");
    if (s) return JSON.parse(s);
  } catch {}
  try {
    const s = localStorage.getItem("hairiq-saved-v1");
    if (s) return JSON.parse(s);
  } catch {}
  return null;
}

// The Blueprint (rev 12) — the paid tier, unlocked as tabs on the site.
// Access is bound to the buyer's EMAIL (signed token from the server after
// a verified Stripe payment), so it survives browsers and devices: on a
// new device, "restore" emails an access link (inbox ownership = auth).
const CRED_KEY = "hairiq-blueprint-v1";

export default function PremiumPage() {
  const [state, setState] = useState("checking"); // checking | locked | unlocked
  const [email, setEmail] = useState("");
  const [tabs, setTabs] = useState(() => buildPremiumTabs(buildProfile(null)));
  const [tab, setTab] = useState("tracker");
  const [restoreEmail, setRestoreEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // personalize every tab from the stored quiz answers (rev 12)
    const answers = readAnswers();
    setTabs(buildPremiumTabs(buildProfile(answers)));
    (async () => {
      // arriving from an access link?
      const params = new URLSearchParams(window.location.search);
      const grantEmail = params.get("email");
      const grant = params.get("grant");
      const grantFp = params.get("fp") || "";
      if (grantEmail && grant) window.history.replaceState(null, "", "/premium");

      let creds = null;
      try {
        creds = JSON.parse(localStorage.getItem(CRED_KEY));
      } catch {}
      if (grantEmail && grant) creds = { email: grantEmail, fp: grantFp, token: grant };
      if (!creds?.email || !creds?.token) return setState("locked");
      try {
        const res = await fetch(
          `/api/premium?email=${encodeURIComponent(creds.email)}&fp=${encodeURIComponent(creds.fp || "")}&token=${encodeURIComponent(creds.token)}`
        );
        const data = await res.json();
        if (data.valid) {
          // rev 13: the purchase covers ONE answer set — if this device's
          // current quiz differs from the paid one, that's a different
          // (unpaid) routine, so the Blueprint stays locked for it.
          if (answers) {
            const { fingerprint } = await import("@/lib/premium-auth");
            const current = await fingerprint(answers);
            if (creds.fp && current !== creds.fp) {
              setMsg(
                "These quiz answers don't match the routine this Blueprint was purchased for. Retake the quiz with your original answers — or unlock this new routine below."
              );
              return setState("locked");
            }
          }
          localStorage.setItem(CRED_KEY, JSON.stringify(creds));
          setEmail(creds.email);
          return setState("unlocked");
        }
      } catch {}
      setState("locked");
    })();
  }, []);

  async function buy() {
    setBusy(true);
    try {
      const answers = readAnswers();
      const { fingerprint } = await import("@/lib/premium-auth");
      const fp = answers ? await fingerprint(answers) : "";
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint: fp }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) return (window.location.href = data.url);
      setMsg(res.status === 503 ? "Payments are almost live — check back soon!" : "Couldn't start checkout — try again.");
    } catch {
      setMsg("Couldn't start checkout — try again.");
    }
    setBusy(false);
  }

  async function restore(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await fetch("/api/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: restoreEmail.trim() }),
      });
      setMsg("📬 If that email has a Blueprint purchase, an access link is on its way — check your inbox.");
    } catch {
      setMsg("Couldn't reach the server — try again.");
    }
    setBusy(false);
  }

  if (state === "checking") return null;

  if (state === "locked") {
    return (
      <main className="mx-auto w-full max-w-lg px-6 pb-16 pt-16 text-center sm:pt-12">
        <p className="font-display text-sm font-bold uppercase tracking-widest text-coral-deep">The Blueprint 🔓</p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight">Every answer, one unlock</h1>
        <p className="mx-auto mt-3 max-w-md text-base font-semibold text-cocoa-soft">
          Twelve deep-dive guides — tracker, where to buy, deals, haircuts, color, bleach, nights,
          swimming, brushing, damage-free styles, supplements, and men&rsquo;s care — yours forever for a
          one-time {PREMIUM.priceLabel}.
        </p>
        <ul className="mx-auto mt-5 flex max-w-md flex-wrap justify-center gap-2">
          {tabs.map((t) => (
            <li key={t.id} className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold text-cocoa shadow-card">
              {t.emoji} {t.title}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={buy}
          disabled={busy}
          className="mt-8 w-full max-w-sm rounded-full bg-berry px-8 py-4 font-display text-lg font-bold text-white shadow-soft transition hover:bg-blush-deep active:scale-95 disabled:opacity-60"
        >
          🔓 {PREMIUM.unlockLabel}
        </button>
        <p className="mt-2 text-xs font-semibold text-cocoa-soft">One-time payment · card, Apple Pay, or Google Pay · tied to your email forever.</p>

        <form onSubmit={restore} className="mx-auto mt-10 max-w-sm rounded-3xl bg-white/70 p-5 text-left shadow-card">
          <h2 className="font-display text-base font-bold">Already bought it?</h2>
          <p className="mt-1 text-xs font-semibold text-cocoa-soft">Enter your purchase email and we&rsquo;ll send an access link.</p>
          <div className="mt-3 flex gap-2">
            <input
              type="email"
              required
              value={restoreEmail}
              onChange={(e) => setRestoreEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-full border-2 border-blush-deep/40 bg-white px-4 py-2.5 text-sm font-semibold focus:border-berry focus:outline-none"
            />
            <button type="submit" disabled={busy} className="rounded-full bg-cocoa px-5 py-2.5 font-display text-sm font-bold text-cream disabled:opacity-60">
              Send
            </button>
          </div>
        </form>
        {msg ? <p className="mt-4 text-sm font-bold">{msg}</p> : null}
        <p className="mt-8">
          <Link href="/" className="text-sm font-bold text-coral-deep underline">← Back home</Link>
        </p>
      </main>
    );
  }

  const active = tabs.find((t) => t.id === tab) || tabs[0];
  return (
    <main className="mx-auto w-full max-w-2xl px-6 pb-16 pt-16 sm:pt-10 lg:max-w-5xl">
      <header className="text-center">
        <p className="font-display text-sm font-bold uppercase tracking-widest text-coral-deep">The Blueprint · unlocked for {email} ✨</p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight">How is my hair… everything</h1>
      </header>

      {/* premium tabs — same pill language as the free tier, wrapping grid */}
      <div className="sticky top-0 z-10 -mx-6 mt-6 bg-cream/95 px-6 py-3 backdrop-blur-sm">
        <div role="tablist" aria-label="Blueprint section" className="flex flex-wrap justify-center gap-1.5">
          {tabs.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => setTab(t.id)}
                className={`min-h-11 whitespace-nowrap rounded-full px-3 py-2 font-display text-[10px] font-extrabold uppercase leading-tight tracking-wide transition active:scale-95 sm:text-xs ${
                  on ? "bg-cocoa text-cream shadow-card" : "bg-white/80 text-cocoa-soft hover:bg-blush/40"
                }`}
              >
                <span aria-hidden="true">{t.emoji}</span> {t.title}
              </button>
            );
          })}
        </div>
      </div>

      <section key={active.id} className="animate-rise mt-6">
        <h2 className="font-display text-2xl font-bold">
          <span aria-hidden="true" className="mr-2">{active.emoji}</span>
          How Is My Hair… {active.title}
        </h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-cocoa-soft">{active.intro}</p>
        {active.interactive ? (
          <div className="mt-5"><Tracker /></div>
        ) : (
          <div className="mt-5 space-y-4">
            {active.sections.map((s) => (
              <div key={s.heading} className="rounded-3xl bg-white/80 p-5 shadow-card">
                <h3 className="font-display text-lg font-bold">{s.heading}</h3>
                {s.body.map((p, i) => (
                  <p key={i} className="mt-2 text-sm font-semibold leading-relaxed text-cocoa-soft">{p}</p>
                ))}
                {s.links ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-butter px-4 py-2 text-xs font-extrabold text-cocoa shadow-card transition hover:bg-coral">
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-10 text-center">
        <Link href="/results" className="text-sm font-bold text-coral-deep underline">← Back to my routine</Link>
      </p>
    </main>
  );
}
