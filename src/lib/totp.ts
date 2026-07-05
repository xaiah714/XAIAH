import { createHmac, randomBytes } from "node:crypto";
import QRCode from "qrcode";

/**
 * RFC 6238 TOTP (the standard behind Google Authenticator / Authy / 1Password
 * TOTP entries) implemented directly on node:crypto — no extra dependency
 * for something this small and security-sensitive.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;
const DIGITS = 6;

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function totpAuthUrl(secret: string, accountEmail: string): string {
  const label = encodeURIComponent(`TutorApp:${accountEmail}`);
  const issuer = encodeURIComponent("TutorApp");
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

export async function totpQrDataUrl(secret: string, accountEmail: string): Promise<string> {
  return QRCode.toDataURL(totpAuthUrl(secret, accountEmail));
}

export function generateTotp(secret: string, timestamp = Date.now()): string {
  const counter = Math.floor(timestamp / 1000 / STEP_SECONDS);
  return hotp(secret, counter);
}

/** Accepts a code from the current or adjacent time step to tolerate clock drift. */
export function verifyTotp(secret: string, token: string, timestamp = Date.now()): boolean {
  const cleanToken = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleanToken)) return false;

  const counter = Math.floor(timestamp / 1000 / STEP_SECONDS);
  for (const offset of [0, -1, 1]) {
    if (hotp(secret, counter + offset) === cleanToken) return true;
  }
  return false;
}

function hotp(base32Secret: string, counter: number): string {
  const key = base32Decode(base32Secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  counterBuffer.writeUInt32BE(counter % 2 ** 32, 4);

  const hmac = createHmac("sha1", key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binCode % 10 ** DIGITS).padStart(DIGITS, "0");
}

function base32Encode(buffer: Buffer): string {
  let bits = "";
  for (const byte of buffer) bits += byte.toString(2).padStart(8, "0");

  let output = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    output += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  const remainder = bits.length % 5;
  if (remainder > 0) {
    const lastChunk = bits.slice(bits.length - remainder).padEnd(5, "0");
    output += BASE32_ALPHABET[parseInt(lastChunk, 2)];
  }
  return output;
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;
    bits += index.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}
