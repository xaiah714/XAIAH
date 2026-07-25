// Weekly newsletter sender (rev 11) — used by the /admin page.
// Password-gated via the ADMIN_PASSWORD secret; recipients are pulled from
// Supabase segmented by the tier preferences each subscriber picked at
// signup, and delivery goes through the same Resend integration as the
// confirmation emails (needs RESEND_API_KEY — same single missing key).
//
// POST { password, action: "preview" | "send", tiers: [...], subject?, html? }
//   preview → { ok, recipients: <count> }   (no email sent)
//   send    → { ok, sent, failedCount }

import { createClient } from "@supabase/supabase-js";
import { emailConfigured, sendNewsletter } from "@/lib/email";

const VALID_TIERS = ["drugstore", "luxury", "crueltyFree"];

function authorized(password) {
  const secret = process.env.ADMIN_PASSWORD;
  return Boolean(secret) && typeof password === "string" && password === secret;
}

async function recipientsFor(tiers) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  // overlaps = subscriber picked ANY of the selected segments
  const { data, error } = await supabase
    .from("hairiq_subscribers")
    .select("email")
    .overlaps("tiers", tiers);
  if (error) throw new Error(error.message);
  return [...new Set(data.map((r) => r.email))];
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: "ADMIN_PASSWORD is not configured on the server." }, { status: 503 });
  }
  if (!authorized(body.password)) {
    return Response.json({ ok: false, error: "Wrong password." }, { status: 401 });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  }

  const tiers = Array.isArray(body.tiers) ? body.tiers.filter((t) => VALID_TIERS.includes(t)) : [];
  if (tiers.length === 0) {
    return Response.json({ ok: false, error: "Pick at least one segment." }, { status: 400 });
  }

  let recipients;
  try {
    recipients = await recipientsFor(tiers);
  } catch (err) {
    console.error("[newsletter] Supabase error:", err.message);
    return Response.json({ ok: false, error: "Couldn't load subscribers." }, { status: 502 });
  }

  if (body.action === "preview") {
    return Response.json({ ok: true, recipients: recipients.length });
  }

  // action: send
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const html = typeof body.html === "string" ? body.html.trim() : "";
  if (!subject || !html) {
    return Response.json({ ok: false, error: "Subject and content are both required." }, { status: 400 });
  }
  if (!emailConfigured()) {
    return Response.json(
      { ok: false, error: "RESEND_API_KEY isn't set yet — sending goes live as soon as it is." },
      { status: 503 }
    );
  }
  if (recipients.length === 0) {
    return Response.json({ ok: true, sent: 0, failedCount: 0 });
  }

  const { sent, failed } = await sendNewsletter({ subject, contentHtml: html, recipients });
  return Response.json({ ok: true, sent, failedCount: failed.length });
}
