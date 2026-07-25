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

export async function mintToken(email) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(email.toLowerCase()));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function checkToken(email, token) {
  if (!secret() || !email || !token) return false;
  const expect = await mintToken(email);
  if (expect.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expect.length; i++) diff |= expect.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}
