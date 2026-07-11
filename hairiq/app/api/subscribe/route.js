// Free segmented email signup (spec §12) — forwards to a third-party email
// service rather than building email infrastructure. Mailchimp is wired as
// the default; subscribers get tagged with their tier preference(s) and a
// ZIP merge field so campaigns can be segmented on the provider's side.
//
// Configure via env (see .env.example):
//   MAILCHIMP_API_KEY      e.g. abc123...-us21 (data center suffix required)
//   MAILCHIMP_AUDIENCE_ID  the list/audience ID
//
// Until those are set, signups validate and return ok but are NOT stored
// (a server-side warning is logged) — swap in Klaviyo/ConvertKit here if
// preferred; this route is the only place that knows about the provider.

const VALID_TIERS = ["drugstore", "luxury", "crueltyFree"];
const TIER_TAGS = { drugstore: "Drugstore", luxury: "Luxury", crueltyFree: "Cruelty-Free" };

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const zip = typeof body.zip === "string" ? body.zip.trim() : "";
  const tiers = Array.isArray(body.tiers) ? body.tiers.filter((t) => VALID_TIERS.includes(t)) : [];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: "That email doesn't look quite right." }, { status: 400 });
  }
  if (tiers.length === 0) {
    return Response.json({ ok: false, error: "Pick at least one topic." }, { status: 400 });
  }
  if (zip && !/^\d{5}(-\d{4})?$/.test(zip)) {
    return Response.json({ ok: false, error: "ZIP should be 5 digits." }, { status: 400 });
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.warn("[subscribe] Email service not configured — signup NOT stored.", { email, tiers, zip });
    return Response.json({ ok: true, configured: false });
  }

  const dataCenter = apiKey.split("-").pop();
  try {
    const res = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/lists/${audienceId}/members`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        tags: tiers.map((t) => TIER_TAGS[t]),
        merge_fields: zip ? { ZIP: zip } : {},
      }),
    });

    if (res.ok) return Response.json({ ok: true, configured: true });

    const detail = await res.json().catch(() => ({}));
    if (detail.title === "Member Exists") {
      return Response.json({ ok: true, configured: true, already: true });
    }
    console.error("[subscribe] Mailchimp error:", detail.title || res.status);
    return Response.json(
      { ok: false, error: "Couldn't sign you up right now — try again in a bit." },
      { status: 502 }
    );
  } catch (err) {
    console.error("[subscribe] Mailchimp request failed:", err);
    return Response.json(
      { ok: false, error: "Couldn't reach the signup service — try again in a bit." },
      { status: 502 }
    );
  }
}
