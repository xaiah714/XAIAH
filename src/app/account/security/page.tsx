import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { totpQrDataUrl } from "@/lib/totp";
import { StartTwoFactorButton } from "./start-two-factor-button";
import { TwoFactorSetupForm } from "./two-factor-setup-form";
import { TwoFactorDisableForm } from "./two-factor-disable-form";

export default async function SecurityPage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">Account security</h1>
      <p className="mt-1 text-sm text-brand-muted">
        {user.role === "TUTOR"
          ? "Strongly recommended for tutor accounts — you're handling payouts and student sessions."
          : "Optional extra protection for your account."}
      </p>

      <div className="card mt-6">
        <h2 className="font-semibold">Two-factor authentication</h2>
        {user.twoFactorEnabled ? (
          <>
            <p className="mt-1 text-sm text-brand-teal-dark">Enabled</p>
            <div className="mt-3">
              <TwoFactorDisableForm />
            </div>
          </>
        ) : user.twoFactorSecret ? (
          <TwoFactorPendingSetup email={user.email} secret={user.twoFactorSecret} />
        ) : (
          <div className="mt-3">
            <p className="text-sm text-brand-muted">
              Adds a 6-digit code from an authenticator app to your login.
            </p>
            <div className="mt-3">
              <StartTwoFactorButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

async function TwoFactorPendingSetup({ email, secret }: { email: string; secret: string }) {
  const qrDataUrl = await totpQrDataUrl(secret, email);

  return (
    <div className="mt-3">
      <p className="text-sm text-brand-muted">
        Scan this with an authenticator app (Google Authenticator, Authy, 1Password...),
        then enter the 6-digit code it shows to turn 2FA on.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrDataUrl} alt="2FA QR code" className="mt-3 h-48 w-48" />
      <p className="mt-2 break-all text-xs text-brand-muted">Manual key: {secret}</p>
      <div className="mt-4">
        <TwoFactorSetupForm />
      </div>
    </div>
  );
}
