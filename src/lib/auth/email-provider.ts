import type { EmailConfig } from "@auth/core/providers/email";
import { sendEmail } from "@/lib/notifications/send";

/**
 * Custom Auth.js email (magic link) provider that reuses our existing
 * sendEmail wrapper — which already logs instead of sending when
 * RESEND_API_KEY isn't configured, so passwordless sign-in works
 * end-to-end in local dev without a real email account.
 *
 * Clicking the link in this email IS the verification: Auth.js marks the
 * user's emailVerified timestamp the moment they complete this flow.
 */
export function ScholarMatchEmailProvider(): EmailConfig {
  return {
    id: "email",
    type: "email",
    name: "Email",
    from: process.env.EMAIL_FROM ?? "notifications@scholarshipmatch.app",
    maxAge: 24 * 60 * 60,
    async sendVerificationRequest({ identifier, url }) {
      await sendEmail(
        identifier,
        "Verify your email to sign in — ScholarMatch",
        `<p>Click below to verify your email and sign in to ScholarMatch.</p>
         <p><a href="${url}">Verify email & sign in</a></p>
         <p style="color:#64748b;font-size:13px">If you didn't request this, you can safely ignore this email.</p>`,
      );
    },
    options: {},
  };
}
