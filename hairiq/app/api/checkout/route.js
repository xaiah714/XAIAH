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
import { PREMIUM } from "@/lib/config";
import { mintToken } from "@/lib/premium-auth";

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
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
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
    // paid → hand back the email-bound access token so the Blueprint
    // unlocks on this device and can be restored on others
    const token = email ? await mintToken(email) : null;
    return Response.json({ ok: true, paid, email, token });
  } catch (err) {
    console.error("[checkout] Session verify failed:", err.message);
    return Response.json({ ok: false, paid: false }, { status: 502 });
  }
}
