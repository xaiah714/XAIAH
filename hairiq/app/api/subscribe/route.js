// Free segmented email signup (spec §12) — self-contained capture-and-store.
// Signups go into our Supabase project (rev 9 — chosen for the Cloudflare
// deployment): one row per email with tier tags, ZIP, and timestamp.
//
// Configure via env (see .env.example / LAUNCH.md):
//   SUPABASE_URL              — the project's API URL
//   SUPABASE_SERVICE_ROLE_KEY — server-only key (never expose client-side)
// Table: hairiq_subscribers — created once by running supabase/schema.sql
// in the Supabase SQL editor. Until the env vars are set, signups validate
// and return ok but are NOT stored (a server warning is logged).
//
// Sending (rev 7): when RESEND_API_KEY is set, every signup also gets a
// confirmation/welcome email and is mirrored into a Resend Audience for
// dashboard-managed newsletters — see lib/email.js for the owner setup.

import { createClient } from "@supabase/supabase-js";
import { emailConfigured, sendWelcomeEmail, addToAudience } from "@/lib/email";

const VALID_TIERS = ["drugstore", "luxury", "crueltyFree"];

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const zip = typeof body.zip === "string" ? body.zip.trim() : "";
  const tiers = Array.isArray(body.tiers) ? body.tiers.filter((t) => VALID_TIERS.includes(t)) : [];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json({ ok: false, error: "That email doesn't look quite right." }, { status: 400 });
  }
  if (tiers.length === 0) {
    return Response.json({ ok: false, error: "Pick at least one topic." }, { status: 400 });
  }
  if (zip && !/^\d{5}(-\d{4})?$/.test(zip)) {
    return Response.json({ ok: false, error: "ZIP should be 5 digits." }, { status: 400 });
  }

  const supabase = getSupabase();
  let stored = false;
  if (!supabase) {
    console.warn("[subscribe] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not configured — signup NOT stored.", { email, tiers, zip });
  } else {
    // Re-signup updates preferences instead of erroring (upsert on email).
    const row = { email, tiers, ...(zip ? { zip } : {}) };
    const { error } = await supabase
      .from("hairiq_subscribers")
      .upsert(row, { onConflict: "email" });
    if (error) {
      console.error("[subscribe] Supabase error:", error.message);
      return Response.json(
        { ok: false, error: "Couldn't save your signup right now — try again in a bit." },
        { status: 502 }
      );
    }
    stored = true;
  }

  // Confirmation email + Audience mirror — best-effort: a delivery hiccup
  // must never fail a signup that's already captured.
  let welcomed = false;
  if (emailConfigured()) {
    try {
      await sendWelcomeEmail({ email, tiers });
      welcomed = true;
    } catch (err) {
      console.error("[subscribe] Welcome email failed:", err.message);
    }
    try {
      await addToAudience({ email });
    } catch (err) {
      console.error("[subscribe] Audience add failed:", err.message);
    }
  } else {
    console.warn("[subscribe] No RESEND_API_KEY — confirmation email skipped.");
  }

  return Response.json({ ok: true, stored, welcomed });
}
