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

export async function sendDisputeReviewEmail(
  to: string,
  subjectName: string,
  questionTitle: string,
  questionId: string
) {
  const link = `${appUrl()}/questions/${questionId}`;
  await sendEmail({
    to,
    subject: `Disputed ${subjectName} question needs review`,
    text: `Two verified tutors disagree on a ${subjectName} question: "${questionTitle}". Review both answers and weigh in — consensus among ${subjectName} tutors resolves it.\n\n${link}`,
    html: `<p>Two verified tutors disagree on a ${subjectName} question: &ldquo;${questionTitle}&rdquo;.</p><p>Review both answers and weigh in — consensus among ${subjectName} tutors resolves it.</p><p><a href="${link}">${link}</a></p>`,
  });
}

/**
 * Owner-facing alert on every dispute — informational, the owner is never
 * required to resolve it (the subject tutor pool does that). Uses
 * ADMIN_ALERT_EMAIL; skips with a log when unset, like every other
 * integration here.
 */
export async function sendAdminDisputeAlert(
  subjectName: string,
  questionTitle: string,
  questionId: string
) {
  const to = process.env.ADMIN_ALERT_EMAIL;
  if (!to) {
    console.log(
      `[email:dev-fallback] ADMIN_ALERT_EMAIL not set — skipping admin dispute alert for "${questionTitle}".`
    );
    return;
  }
  const link = `${appUrl()}/questions/${questionId}`;
  await sendEmail({
    to,
    subject: `Tutor disagreement on a ${subjectName} question`,
    text: `Two verified tutors disagree on: "${questionTitle}" (${subjectName}). It's been posted to the ${subjectName} review board and all ${subjectName} tutors were notified — no action needed from you unless you want to look.\n\n${link}`,
    html: `<p>Two verified tutors disagree on: &ldquo;${questionTitle}&rdquo; (${subjectName}).</p><p>It's been posted to the ${subjectName} review board and all ${subjectName} tutors were notified — no action needed from you unless you want to look.</p><p><a href="${link}">${link}</a></p>`,
  });
}

/**
 * Contact-form submissions (from /help) go to the platform owner via
 * ADMIN_ALERT_EMAIL — console-logged when unset, like everything else.
 */
export async function sendContactEmail(fromEmail: string, message: string) {
  const to = process.env.ADMIN_ALERT_EMAIL;
  if (!to) {
    console.log(
      `[email:dev-fallback] ADMIN_ALERT_EMAIL not set — contact form message from ${fromEmail}:\n${message}\n`
    );
    return;
  }
  await sendEmail({
    to,
    subject: `TutorApp contact form: message from ${fromEmail}`,
    text: `From: ${fromEmail}\n\n${message}`,
    html: `<p><strong>From:</strong> ${fromEmail}</p><p style="white-space:pre-wrap">${message
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")}</p>`,
  });
}
