// Free segmented email signup (spec §12) — self-contained capture-and-store.
// Signups go straight into our own Postgres (Vercel Postgres or any provider
// that hands us a connection string): one row per email with tier tags, ZIP,
// and timestamp. No third-party marketing account needed to CAPTURE signups.
//
// Configure via env (see .env.example): POSTGRES_URL (set automatically when
// you attach Vercel Postgres) or DATABASE_URL. Until one is set, signups
// validate and return ok but are NOT stored (a server warning is logged).
//
// Honest limit (per spec): actually SENDING newsletters later needs an email
// delivery service (Resend, Postmark, etc.) with human domain/sender
// verification — that's a separate future task; this table is the list
// they'll import/segment from (tiers + ZIP are stored for exactly that).

import { Pool } from "pg";

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
  if (!db) {
    console.warn("[subscribe] No POSTGRES_URL/DATABASE_URL configured — signup NOT stored.", { email, tiers, zip });
    return Response.json({ ok: true, stored: false });
  }

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
    return Response.json({ ok: true, stored: true });
  } catch (err) {
    console.error("[subscribe] Database error:", err.message);
    return Response.json(
      { ok: false, error: "Couldn't save your signup right now — try again in a bit." },
      { status: 502 }
    );
  }
}
