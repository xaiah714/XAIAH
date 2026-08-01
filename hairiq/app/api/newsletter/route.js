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
import { emailConfigured, sendNewsletter, sendPurchaseEmail } from "@/lib/email";

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
  // Preview the purchase receipt buyers get (rev 14) — same code path as a
  // real payment, so you can check wording/links any time.
  if (body.action === "test-receipt") {
    const to = typeof body.to === "string" ? body.to.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return Response.json({ ok: false, error: "Enter a valid email to send the sample to." }, { status: 400 });
    }
    if (!emailConfigured()) {
      return Response.json({ ok: false, error: "RESEND_API_KEY isn't set yet." }, { status: 503 });
    }
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    await sendPurchaseEmail({
      to,
      email: to,
      headline: "Your plan for smooth, calm hair",
      blurb: "Sample receipt — this is exactly what a buyer receives right after paying.",
      routineUrl: `${origin}/results`,
      blueprintUrl: `${origin}/premium`,
      amountCents: 199,
    });
    return Response.json({ ok: true, sent: 1 });
  }

  // Backfill/repair the purchase ledger from Stripe (rev 14) — Stripe is
  // always the source of truth, so this can rebuild the table any time.
  if (body.action === "sync-purchases") {
    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ ok: false, error: "STRIPE_SECRET_KEY isn't set." }, { status: 503 });
    }
    const { default: Stripe } = await import("stripe");
    const { recordPurchase } = await import("@/app/api/checkout/route");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    let synced = 0;
    let failed = 0;
    for (const s of sessions.data) {
      if (s.payment_status !== "paid") continue;
      const email = s.customer_details?.email;
      if (!email) continue;
      const ok = await recordPurchase({ session: s, email, fp: s.metadata?.fp || "" });
      ok ? synced++ : failed++;
    }
    return Response.json({ ok: true, synced, failed });
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
