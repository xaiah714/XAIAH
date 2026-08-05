// ---------------------------------------------------------------------------
// Email delivery (rev 7) — Resend (resend.com), chosen for exactly the
// "easy to manage as we grow" requirement:
//   • confirmation/welcome emails send from code (here),
//   • the subscriber list mirrors into a Resend "Audience" the owner can
//     browse in Resend's dashboard, and
//   • future newsletters are written + sent from Resend's Broadcasts UI
//     (no code changes) with unsubscribe links handled automatically.
// Postgres (hairiq_subscribers) stays the segmented source of truth — it
// keeps the tier tags + ZIPs that Audiences don't model.
//
// Owner setup (one-time, ~5 min):
//   1. Create a free Resend account → API Keys → set RESEND_API_KEY.
//   2. Verify the sending domain (Resend → Domains → add DNS records),
//      then set NEWSLETTER_FROM, e.g.  How Is My Hair <hello@howsmyhair.org>
//      (until then the resend.dev test sender below works, but only
//      delivers to the Resend account owner's own inbox).
//   3. Optional: create an Audience → set RESEND_AUDIENCE_ID so signups
//      appear in the dashboard list for Broadcasts.
// ---------------------------------------------------------------------------

import { NEWSLETTER_TIERS } from "./config";

const RESEND_API = "https://api.resend.com";

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function fromAddress() {
  return process.env.NEWSLETTER_FROM || "How Is My Hair <onboarding@resend.dev>";
}

async function resend(path, payload) {
  const res = await fetch(`${RESEND_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${path} → ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res.json();
}

function tierLabels(tiers) {
  return NEWSLETTER_TIERS.filter((t) => tiers.includes(t.value)).map((t) => t.label);
}

// Confirmation/welcome email, sent right after signup so subscribers get
// something in their inbox immediately (and know the signup worked).
export async function sendWelcomeEmail({ email, tiers }) {
  const topics = tierLabels(tiers);
  const topicLine =
    topics.length === NEWSLETTER_TIERS.length
      ? "all three lists — Affordable deals, Luxury picks, and Cruelty-free finds"
      : topics.join(" + ");
  await resend("/emails", {
    from: fromAddress(),
    to: [email],
    subject: "You're in 💌 — welcome to How Is My Hair",
    html: `
      <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px 20px;color:#2e1c15">
        <div style="background:linear-gradient(135deg,#ff61a3,#ff8d61);border-radius:20px;padding:26px 22px;text-align:center">
          <h1 style="margin:0;color:#ffffff;font-size:26px">You're in! 💌</h1>
        </div>
        <p style="font-size:15px;line-height:1.6">Thanks for signing up to <strong>How Is My Hair</strong> — you picked <strong>${topicLine}</strong>.</p>
        <p style="font-size:15px;line-height:1.6">That's exactly (and only) what we'll send: new products worth knowing about, treatments that actually work, and deals when we spot them.</p>
        <p style="font-size:13px;line-height:1.6;color:#4d2f24">No spam, no daily blasts — and you can unsubscribe from any email, any time.</p>
      </div>
    `,
  });
}

// Mirror the signup into a Resend Audience so future newsletters can be
// composed and sent from Resend's Broadcasts dashboard without code.
export async function addToAudience({ email }) {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) return false;
  await resend(`/audiences/${audienceId}/contacts`, { email, unsubscribed: false });
  return true;
}

// Purchase receipt (rev 14) — sent immediately after a verified $1.99
// payment. Separate flow from the newsletter welcome email: it confirms
// the charge and carries permanent links to view/print (Save as PDF) the
// routine and open the Blueprint, so the purchase is never trapped in one
// browser.
export async function sendPurchaseEmail({ email, headline, blurb, routineUrl, blueprintUrl, amountCents }) {
  const price = `$${((amountCents || 199) / 100).toFixed(2)}`;
  await resend("/emails", {
    from: fromAddress(),
    to: [email],
    subject: "Your routine is unlocked 🔓 — How's my hair?",
    html: `
      <div style="font-family:Helvetica,Arial,sans-serif;max-width:540px;margin:0 auto;padding:28px 20px;color:#2e1c15">
        <div style="background:linear-gradient(135deg,#ff61a3,#ff8d61);border-radius:20px;padding:24px 22px;text-align:center">
          <h1 style="margin:0;color:#ffffff;font-size:24px">You're unlocked! 🔓</h1>
        </div>
        <p style="font-size:15px;line-height:1.6">Thank you — your <strong>${price}</strong> payment went through, and your personalized routine is yours to keep.</p>
        ${headline ? `<div style="background:#ffe9f3;border-radius:16px;padding:16px 18px;margin:18px 0"><p style="margin:0;font-size:17px;font-weight:bold">${headline}</p>${blurb ? `<p style="margin:6px 0 0;font-size:14px;line-height:1.55;color:#4d2f24">${blurb}</p>` : ""}</div>` : ""}
        <p style="text-align:center;margin:26px 0 10px">
          <a href="${routineUrl}" style="display:inline-block;background:#b3125a;color:#fff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:999px">View &amp; print my routine</a>
        </p>
        <p style="text-align:center;margin:0 0 22px">
          <a href="${blueprintUrl}" style="display:inline-block;background:#2e1c15;color:#fff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:999px">Open my Blueprint — 12 guides</a>
        </p>
        <p style="font-size:13px;line-height:1.6;color:#4d2f24">Tip: open the routine link and use your browser's <strong>Print → Save as PDF</strong> to keep an offline copy. Both links work on any device — bookmark this email.</p>
        <p style="font-size:12px;line-height:1.6;color:#4d2f24">Questions? Just reply to this email.</p>
      </div>
    `,
  });
}

// Gifted access (rev 17) — the owner comping someone in for free.
export async function sendGiftEmail({ email, link }) {
  await resend("/emails", {
    from: fromAddress(),
    to: [email],
    subject: "You've been given full access 💝 — How's my hair?",
    html: `
      <div style="font-family:Helvetica,Arial,sans-serif;max-width:540px;margin:0 auto;padding:28px 20px;color:#2e1c15">
        <div style="background:linear-gradient(135deg,#ff61a3,#ff8d61);border-radius:20px;padding:24px 22px;text-align:center">
          <h1 style="margin:0;color:#ffffff;font-size:24px">A gift for you 💝</h1>
        </div>
        <p style="font-size:15px;line-height:1.6">You've been given <strong>full free access</strong> to How's my hair? — the personalized routine plus all twelve Blueprint guides.</p>
        <p style="text-align:center;margin:26px 0">
          <a href="${link}" style="display:inline-block;background:#b3125a;color:#fff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px">Unlock my access</a>
        </p>
        <p style="font-size:13px;line-height:1.6;color:#4d2f24">Tap it once on each device you use — it never expires, and you can retake the quiz as often as you like.</p>
      </div>
    `,
  });
}

// Weekly newsletter (rev 11) — wraps the owner's pasted content in the
// brand shell and sends via Resend's batch endpoint (100 emails/call).
function newsletterHtml(contentHtml) {
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:28px 20px;color:#2e1c15">
      <div style="background:linear-gradient(135deg,#ff61a3,#ff8d61);border-radius:20px;padding:20px 22px;text-align:center;margin-bottom:22px">
        <h1 style="margin:0;color:#ffffff;font-size:22px">How's my hair? 💌</h1>
      </div>
      <div style="font-size:15px;line-height:1.65">${contentHtml}</div>
      <p style="margin-top:26px;font-size:12px;line-height:1.6;color:#4d2f24">
        You're getting this because you signed up on howsmyhair.org. Reply to say hi —
        or reply "unsubscribe" and we'll take you off the list right away.
      </p>
    </div>`;
}

export async function sendNewsletter({ subject, contentHtml, recipients }) {
  const from = fromAddress();
  const html = newsletterHtml(contentHtml);
  let sent = 0;
  const failed = [];
  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100);
    try {
      await resend("/emails/batch", chunk.map((to) => ({ from, to: [to], subject, html })));
      sent += chunk.length;
    } catch (err) {
      console.error("[newsletter] Batch failed:", err.message);
      failed.push(...chunk);
    }
  }
  return { sent, failed };
}
