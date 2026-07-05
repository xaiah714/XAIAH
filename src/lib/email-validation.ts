import { resolveMx } from "node:dns/promises";

/**
 * Layered signup email validation. Live inbox-existence checking isn't
 * possible (mail servers don't reveal it), so the layers are:
 *   1. strict format (zod .email() upstream, plus a domain-shape check here)
 *   2. typo TLDs (.con etc.) and typo'd big providers (gmial.com, ...)
 *   3. known disposable/throwaway providers
 *   4. DNS MX lookup — does this domain accept mail at all? Fails OPEN on
 *      DNS/network errors so an outage never blocks real signups.
 * The last line of defense stays the verification gate: nothing gated
 * (posting, answering, chat) works until the emailed link is clicked, so an
 * account on a fake inbox is useless anyway.
 */

// TLDs that are almost always a typo of .com/.co/.net/.org
const TYPO_TLDS = new Set(["con", "cmo", "ocm", "vom", "comm", "cim", "coom", "nte", "ogr", "orgg"]);

const TYPO_DOMAINS = new Set([
  "gmial.com", "gamil.com", "gnail.com", "gmal.com", "gmaill.com", "gmail.co",
  "hotmial.com", "hotmall.com", "hotmail.co",
  "yaho.com", "yahooo.com", "yahoo.co",
  "outlok.com", "outloook.com",
  "iclod.com", "icloud.co",
]);

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "sharklasers.com",
  "10minutemail.com", "10minemail.com", "temp-mail.org", "tempmail.com",
  "tempmail.net", "tempmailo.com", "throwawaymail.com", "yopmail.com",
  "getnada.com", "nada.email", "dispostable.com", "maildrop.cc",
  "fakeinbox.com", "trashmail.com", "trashmail.de", "mohmal.com",
  "mytemp.email", "burnermail.io", "spamgourmet.com", "mailnesia.com",
  "mintemail.com", "tempinbox.com", "emailondeck.com", "moakt.com",
]);

export type EmailCheck = { ok: true } | { ok: false; reason: string };

const REJECT: EmailCheck = { ok: false, reason: "Please use a real email address." };

export async function checkSignupEmail(email: string): Promise<EmailCheck> {
  const at = email.lastIndexOf("@");
  if (at < 1) return REJECT;
  const domain = email.slice(at + 1).toLowerCase();

  // Domain shape: at least one dot, sane labels, letters-only TLD of >= 2 chars
  const labels = domain.split(".");
  if (labels.length < 2 || labels.some((l) => l.length === 0 || !/^[a-z0-9-]+$/.test(l))) {
    return REJECT;
  }
  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,}$/.test(tld)) return REJECT;

  if (TYPO_TLDS.has(tld)) return REJECT;
  if (TYPO_DOMAINS.has(domain)) return REJECT;
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, reason: "Please use a real, non-disposable email address." };
  }

  // MX lookup with a short timeout; fail open on infrastructure errors,
  // fail closed when DNS answers definitively "this domain doesn't exist".
  try {
    const records = await Promise.race([
      resolveMx(domain),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000)),
    ]);
    if (!records || records.length === 0) return REJECT;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOTFOUND" || code === "ENODATA") return REJECT;
    // timeout / servfail / no network — don't block a possibly-real signup
  }

  return { ok: true };
}
