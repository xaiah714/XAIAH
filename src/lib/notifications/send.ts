// Thin REST wrappers around Twilio (SMS) and Resend (email) so the scheduler
// doesn't need either SDK as a hard dependency. When credentials aren't
// configured (e.g. local dev), sends are logged instead of attempted so the
// rest of the pipeline can be exercised end-to-end without live accounts.

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "notifications@scholarshipmatch.app";

export async function sendSms(to: string, body: string): Promise<boolean> {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
    console.log(`[notifications:sms:dry-run] to=${to} body=${body}`);
    return true;
  }

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body }),
  });

  if (!res.ok) {
    console.error(`[notifications:sms:error] ${res.status} ${await res.text()}`);
  }
  return res.ok;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[notifications:email:dry-run] to=${to} subject=${subject}\n${html}`);
    return true;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
  });

  if (!res.ok) {
    console.error(`[notifications:email:error] ${res.status} ${await res.text()}`);
  }
  return res.ok;
}
