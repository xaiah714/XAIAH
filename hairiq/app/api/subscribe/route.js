// Free segmented email signup (spec §12) — self-contained capture-and-store.
// Signups go straight into our own Postgres (Vercel Postgres or any provider
// that hands us a connection string): one row per email with tier tags, ZIP,
// and timestamp. No third-party marketing account needed to CAPTURE signups.
//
// Configure via env (see .env.example): POSTGRES_URL (set automatically when
// you attach Vercel Postgres) or DATABASE_URL. Until one is set, signups
// validate and return ok but are NOT stored (a server warning is logged).
//
// Sending (rev 7): when RESEND_API_KEY is set, every signup also gets a
// confirmation/welcome email and is mirrored into a Resend Audience for
// dashboard-managed newsletters — see lib/email.js for the owner setup.
// Delivery still requires the owner's one-time domain verification there;
// until the key is set, signups store fine and simply skip the email.

import { Pool } from "pg";
import { emailConfigured, sendWelcomeEmail, addToAudience } from "@/lib/email";

const VALID_TIERS = ["drugstore", "luxury", "crueltyFree"];

let pool = null;
let tableReady = false;

function getPool() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      max: 3,
      ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function ensureTable(db) {
  if (tableReady) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS hairiq_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      tiers TEXT[] NOT NULL,
      zip TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  tableReady = true;
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

  const db = getPool();
  let stored = false;
  if (!db) {
    console.warn("[subscribe] No POSTGRES_URL/DATABASE_URL configured — signup NOT stored.", { email, tiers, zip });
  } else {
    try {
      await ensureTable(db);
      // Re-signup updates preferences instead of erroring.
      await db.query(
        `INSERT INTO hairiq_subscribers (email, tiers, zip)
         VALUES ($1, $2, NULLIF($3, ''))
         ON CONFLICT (email) DO UPDATE
           SET tiers = EXCLUDED.tiers,
               zip = COALESCE(NULLIF(EXCLUDED.zip, ''), hairiq_subscribers.zip)`,
        [email, tiers, zip]
      );
      stored = true;
    } catch (err) {
      console.error("[subscribe] Database error:", err.message);
      return Response.json(
        { ok: false, error: "Couldn't save your signup right now — try again in a bit." },
        { status: 502 }
      );
    }
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
