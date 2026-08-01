// ---------------------------------------------------------------------------
// Premium checkout (rev 7) — Stripe Checkout, spec §13.1's "Unlock for $1.99"
// made real. POST creates a hosted Checkout Session (card + Apple Pay +
// Google Pay are automatic on Stripe's page); GET verifies a finished
// session so the client can unlock. No accounts yet (§13 v2), so the
// unlock is stored client-side per device after verification.
//
// Owner setup (one-time, ~5 min):
//   1. Create a Stripe account → Developers → API keys → set
//      STRIPE_SECRET_KEY (sk_live_… — or sk_test_… to test first).
//   2. Optional: create a Product/Price in the Stripe dashboard and set
//      STRIPE_PRICE_ID to manage the price without deploys; otherwise the
//      $1.99 from lib/config.js is charged directly.
//   3. Apple Pay / Google Pay appear automatically on the hosted page once
//      the domain is registered (Stripe → Settings → Payment method domains).
// Until STRIPE_SECRET_KEY is set, this returns 503 and the button shows a
// friendly "almost live" note instead of a broken checkout.
// ---------------------------------------------------------------------------

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { PREMIUM } from "@/lib/config";
import { mintToken } from "@/lib/premium-auth";
import { emailConfigured, sendPurchaseEmail } from "@/lib/email";
import { buildRoutine } from "@/lib/recommendations";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // fetch-based HTTP client so the same code runs on Cloudflare Workers
  // (no Node http sockets there) and locally.
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
}

function siteOrigin(request) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.headers.get("origin") ||
    new URL(request.url).origin
  );
}

export async function POST(request) {
  const stripe = getStripe();
  if (!stripe) {
    console.warn("[checkout] No STRIPE_SECRET_KEY configured — payments not live.");
    return Response.json(
      { ok: false, error: "payments-not-configured" },
      { status: 503 }
    );
  }

  const origin = siteOrigin(request);
  // the answers fingerprint travels in session metadata: the payment is
  // for ONE exact routine, and verification hands back a token bound to it.
  // The answers ride along too (rev 14) so the receipt email can link to a
  // routine that opens on ANY device, and so the purchase ledger is useful.
  let fp = "";
  let ans = "";
  try {
    const body = await request.json();
    if (typeof body.fingerprint === "string" && /^[a-f0-9]{16,64}$/.test(body.fingerprint)) fp = body.fingerprint;
    if (body.answers && typeof body.answers === "object") {
      const packed = JSON.stringify(body.answers);
      if (packed.length <= 480) ans = packed; // Stripe metadata value limit
    }
  } catch {}
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      metadata: { fp, ans },
      // create a Customer so purchases are findable by email later
      // (cross-device "restore my Blueprint" — see /api/premium)
      customer_creation: "always",
      line_items: [
        process.env.STRIPE_PRICE_ID
          ? { price: process.env.STRIPE_PRICE_ID, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: PREMIUM.currency,
                unit_amount: PREMIUM.amountCents,
                product_data: { name: PREMIUM.productName },
              },
            },
      ],
      success_url: `${origin}/results?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/results?checkout=cancelled`,
    });
    return Response.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("[checkout] Session create failed:", err.message);
    return Response.json(
      { ok: false, error: "Couldn't start checkout — try again in a moment." },
      { status: 502 }
    );
  }
}

// Verify a completed session (success redirect calls this before unlocking).
export async function GET(request) {
  const stripe = getStripe();
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!stripe || !sessionId) {
    return Response.json({ ok: false, paid: false }, { status: 400 });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";
    const email = paid ? session.customer_details?.email || null : null;
    const fp = session.metadata?.fp || "";
    // paid → access token bound to email + the exact answers paid for
    const token = email ? await mintToken(email, fp) : null;

    // Receipt + ledger (rev 14). Idempotent: the session's own metadata is
    // the "already handled" flag, so refreshing the success page never
    // double-sends. Never let a mail/DB hiccup break the unlock.
    if (paid && email) {
      try {
        // ledger first, always: the upsert is keyed on the session id, so
        // re-running verify later (e.g. after the table is created) safely
        // backfills without duplicates
        await recordPurchase({ session, email, fp });
      } catch (err) {
        console.error("[checkout] Purchase ledger error:", err.message);
      }
      if (session.metadata?.receipt !== "1") {
        try {
          // flag BEFORE sending so a refresh can never double-send
          await stripe.checkout.sessions.update(sessionId, {
            metadata: { ...session.metadata, receipt: "1" },
          });
          await sendReceipt({ session, email, origin: siteOrigin(request) });
        } catch (err) {
          console.error("[checkout] Receipt failed:", err.message);
        }
      }
    }
    return Response.json({ ok: true, paid, email, fp, token });
  } catch (err) {
    console.error("[checkout] Session verify failed:", err.message);
    return Response.json({ ok: false, paid: false }, { status: 502 });
  }
}

function answersOf(session) {
  try {
    return session.metadata?.ans ? JSON.parse(session.metadata.ans) : null;
  } catch {
    return null;
  }
}

// Customer ledger row for one paid session (idempotent on session id).
export async function recordPurchase({ session, email, fp }) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return false;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.from("hairiq_purchases").upsert(
    {
      stripe_session_id: session.id,
      email,
      fingerprint: fp || session.metadata?.fp || null,
      answers: answersOf(session),
      amount_cents: session.amount_total ?? null,
      currency: session.currency || "usd",
      livemode: Boolean(session.livemode),
      receipt_sent: session.metadata?.receipt === "1",
      paid_at: session.created ? new Date(session.created * 1000).toISOString() : undefined,
    },
    { onConflict: "stripe_session_id" }
  );
  if (error) {
    console.error("[checkout] Purchase not recorded:", error.message);
    return false;
  }
  return true;
}

// Receipt email with permanent links to the routine + Blueprint.
async function sendReceipt({ session, email, origin }) {
  const answers = answersOf(session);
  if (!emailConfigured()) {
    console.warn("[checkout] No RESEND_API_KEY — purchase receipt skipped.");
    return;
  }
  let headline = null;
  let blurb = null;
  let routineUrl = `${origin}/results`;
  if (answers) {
    try {
      const r = buildRoutine(answers);
      headline = r.summary.headline;
      blurb = r.summary.blurb;
    } catch {}
    const packed = btoa(unescape(encodeURIComponent(JSON.stringify(answers))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    routineUrl = `${origin}/results?a=${packed}`;
  }
  await sendPurchaseEmail({
    email,
    headline,
    blurb,
    routineUrl,
    blueprintUrl: `${origin}/premium`,
    amountCents: session.amount_total ?? PREMIUM.amountCents,
  });
}
