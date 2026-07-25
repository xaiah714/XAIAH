// Premium access tokens (rev 12) — HMAC-signed proof that an email has
// purchased the Blueprint. Stateless: Stripe is the purchase registry
// (checkout sessions carry the buyer email), so no extra tables. Tokens
// are minted server-side only after either (a) a verified paid checkout
// session or (b) an email-ownership-proving access link. Web Crypto, so
// the same code runs on Cloudflare Workers and Node.

function secret() {
  // dedicated secret if set; falls back to the admin password so no new
  // required config
  return process.env.PREMIUM_SECRET || process.env.ADMIN_PASSWORD || "";
}

// Canonical fingerprint of one exact set of quiz answers (rev 13) — a
// payment buys THIS routine, not the device. Same answers → same hash →
// free re-unlock; any change → different hash → new payment. Runs in the
// browser and on Workers (Web Crypto only).
export async function fingerprint(answers) {
  const a = answers || {};
  const canon = Object.keys(a)
    .sort()
    .map((k) => {
      const v = a[k];
      return `${k}=${Array.isArray(v) ? [...v].sort().join(",") : String(v)}`;
    })
    .join("|");
  const dig = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canon));
  return [...new Uint8Array(dig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function mintToken(email, fp = "") {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${email.toLowerCase()}|${fp}`)
  );
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function checkToken(email, fp, token) {
  if (!secret() || !email || !token) return false;
  const expect = await mintToken(email, fp || "");
  if (expect.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expect.length; i++) diff |= expect.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}
