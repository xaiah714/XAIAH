// Blueprint access API (rev 12).
//   GET  ?email&token            → { ok, valid }  (device unlock check)
//   POST { email }               → cross-device restore: if Stripe shows a
//        succeeded Blueprint purchase for that email, email the owner an
//        access link via Resend. Proving inbox ownership is the auth —
//        typing someone else's email gets you nothing.

import Stripe from "stripe";
import { mintToken, checkToken } from "@/lib/premium-auth";
import { emailConfigured } from "@/lib/email";

export async function GET(request) {
  const url = new URL(request.url);
  const valid = await checkToken(url.searchParams.get("email") || "", url.searchParams.get("token") || "");
  return Response.json({ ok: true, valid });
}

async function hasPurchase(stripe, email) {
  const customers = await stripe.customers.search({ query: `email:'${email.replace(/'/g, "")}'`, limit: 10 });
  for (const c of customers.data) {
    const pis = await stripe.paymentIntents.list({ customer: c.id, limit: 20 });
    if (pis.data.some((pi) => pi.status === "succeeded")) return true;
  }
  return false;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: "That email doesn't look quite right." }, { status: 400 });
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !emailConfigured()) {
    return Response.json({ ok: false, error: "Restore isn't available yet — try again soon." }, { status: 503 });
  }

  const stripe = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
  let purchased = false;
  try {
    purchased = await hasPurchase(stripe, email);
  } catch (err) {
    console.error("[premium] Stripe lookup failed:", err.message);
    return Response.json({ ok: false, error: "Couldn't check purchases right now." }, { status: 502 });
  }

  // Always answer the same either way — no purchase-status oracle.
  if (purchased) {
    const token = await mintToken(email);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const link = `${origin}/premium?email=${encodeURIComponent(email)}&grant=${token}`;
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.NEWSLETTER_FROM || "How Is My Hair <onboarding@resend.dev>",
          to: [email],
          subject: "Your Blueprint access link 🔓",
          html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px 20px;color:#2e1c15"><p style="font-size:15px;line-height:1.6">Tap below to unlock your <b>How Is My Hair Blueprint</b> on this device:</p><p><a href="${link}" style="display:inline-block;background:#b3125a;color:#fff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px">Open my Blueprint</a></p><p style="font-size:12px;color:#4d2f24">Didn't request this? You can ignore it.</p></div>`,
        }),
      });
    } catch (err) {
      console.error("[premium] Access link send failed:", err.message);
    }
  }
  return Response.json({ ok: true, sent: true });
}
