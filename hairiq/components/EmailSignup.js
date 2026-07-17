"use client";

import { useState } from "react";
import { NEWSLETTER_TIERS } from "@/lib/config";

// Free segmented email signup (spec §12). Sits at the very bottom of the
// results screen, visually separate from the paywall — this is a free
// value-add, not tied to payment. Subscribers are tagged by the tier(s)
// they pick (plus optional ZIP) so campaigns can be segmented server-side.
export default function EmailSignup() {
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [tiers, setTiers] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState("");

  const allSelected = tiers.length === NEWSLETTER_TIERS.length;

  function toggleTier(value) {
    setTiers((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]));
  }

  function toggleAll() {
    setTiers(allSelected ? [] : NEWSLETTER_TIERS.map((t) => t.value));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("That email doesn't look quite right.");
      return;
    }
    if (tiers.length === 0) {
      setError("Pick at least one topic — or grab all three.");
      return;
    }
    if (zip.trim() && !/^\d{5}(-\d{4})?$/.test(zip.trim())) {
      setError("ZIP should be 5 digits (or leave it blank).");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), tiers, zip: zip.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("done");
      } else {
        setStatus("error");
        setError(data.error || "Couldn't sign you up right now — try again in a bit.");
      }
    } catch {
      setStatus("error");
      setError("Couldn't reach the signup service — check your connection and try again.");
    }
  }

  if (status === "done") {
    return (
      <section className="rounded-3xl bg-blush/30 p-6 text-center">
        <h2 className="font-display text-xl font-bold">You're in! 💌</h2>
        <p className="mt-2 text-sm font-semibold text-cocoa-soft">
          We'll only send what you picked — new products, treatments, and deals. Unsubscribe anytime.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-blush/30 p-6" aria-label="Email signup">
      <h2 className="font-display text-xl font-bold">
        Get new products, treatments, and deals sent to you 💌
      </h2>
      <p className="mt-1.5 text-sm font-semibold text-cocoa-soft">
        Free, and segmented to what you actually care about — pick one, two, or all three.
      </p>

      <form onSubmit={submit} className="mt-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Newsletter topics">
          {NEWSLETTER_TIERS.map((tier) => {
            const selected = tiers.includes(tier.value);
            return (
              <button
                key={tier.value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleTier(tier.value)}
                className={`min-h-11 rounded-full border-2 px-4 py-2 font-display text-sm font-bold transition active:scale-95 ${
                  selected ? "border-coral-deep bg-coral text-cocoa" : "border-blush-deep/40 bg-white text-cocoa-soft hover:border-coral"
                }`}
              >
                {tier.label}
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={allSelected}
            onClick={toggleAll}
            className={`min-h-11 rounded-full border-2 px-4 py-2 font-display text-sm font-bold transition active:scale-95 ${
              allSelected ? "border-coral-deep bg-coral text-cocoa" : "border-blush-deep/40 bg-white text-cocoa-soft hover:border-coral"
            }`}
          >
            All three ✨
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className="w-full rounded-full border-2 border-blush-deep/40 bg-white px-5 py-3 text-sm font-semibold placeholder:text-cocoa-soft/60 focus:border-coral-deep focus:outline-none"
          />
          <input
            type="text"
            inputMode="numeric"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="ZIP (optional)"
            aria-label="ZIP code (optional)"
            className="w-full rounded-full border-2 border-blush-deep/40 bg-white px-5 py-3 text-sm font-semibold placeholder:text-cocoa-soft/60 focus:border-coral-deep focus:outline-none sm:w-40"
          />
        </div>
        <p className="mt-2 text-xs font-semibold text-cocoa-soft/80">
          ZIP just helps us point you to options in your area — no location tracking.
        </p>

        {error ? <p className="mt-2 text-sm font-bold text-coral-deep">{error}</p> : null}

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-4 w-full rounded-full bg-coral px-8 py-3.5 font-display text-base font-bold text-cocoa shadow-soft transition hover:bg-coral-deep hover:text-cream active:scale-95 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          {status === "sending" ? "Signing you up…" : "Sign me up"}
        </button>
      </form>
    </section>
  );
}
