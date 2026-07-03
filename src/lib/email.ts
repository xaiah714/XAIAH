import { Resend } from "resend";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "TutorApp <onboarding@resend.dev>";

type SendEmailInput = { to: string; subject: string; html: string; text: string };

/**
 * Resend is the assumed provider (set RESEND_API_KEY to send for real).
 * Without a key, emails are logged to the server console instead of failing
 * outright — lets the verification/2FA flows be exercised in dev without a
 * live provider, same pattern as the Stripe test-mode fallback.
 */
async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[email:dev-fallback] To: ${to}\nSubject: ${subject}\n\n${text}\n`);
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({ from: FROM_ADDRESS, to, subject, html, text });
}

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${appUrl()}/verify-email/${token}`;
  await sendEmail({
    to,
    subject: "Verify your TutorApp email",
    text: `Confirm your email to finish setting up your TutorApp account: ${link}\n\nThis link expires in 24 hours.`,
    html: `<p>Confirm your email to finish setting up your TutorApp account:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`,
  });
}
