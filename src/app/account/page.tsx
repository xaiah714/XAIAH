import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { ProfileForm } from "./profile-form";

export default async function AccountPage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    include: { subscription: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Account</h1>
      <p className="mt-1 text-sm text-brand-muted">
        {user.name} · {user.email} · {user.role.toLowerCase()}
      </p>
      {!user.emailVerified && (
        <p className="mt-2 rounded-xl bg-brand-purple-light px-4 py-3 text-sm text-brand-purple-dark">
          Your email isn&apos;t verified yet.{" "}
          <Link href="/verify-email" className="underline">
            Finish verifying
          </Link>{" "}
          to unlock posting and live chat.
        </p>
      )}

      <div className="card mt-6">
        <ProfileForm
          timezone={user.timezone}
          gender={user.gender}
          role={user.role}
          gradeLevel={user.gradeLevel ?? ""}
        />
      </div>

      <div className="card mt-6">
        <h2 className="font-semibold">Security</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Two-factor authentication: {user.twoFactorEnabled ? "on" : "off"}
        </p>
        <Link href="/account/security" className="btn-secondary mt-3 inline-flex !px-4 !py-2 text-sm">
          Manage security
        </Link>
      </div>

      {user.role === "STUDENT" && (
        <div className="card mt-6">
          <h2 className="font-semibold">Subscription</h2>
          <p className="mt-1 text-sm text-brand-muted">
            {user.subscription?.status === "ACTIVE"
              ? "You have unlimited live chat and async tutor answers."
              : "You're on the free community plan. Upgrade for unlimited live chat."}
          </p>
          <Link href="/account/subscription" className="btn-primary mt-3 inline-flex !px-4 !py-2 text-sm">
            Manage subscription
          </Link>
        </div>
      )}

      {user.role === "TUTOR" && (
        <div className="card mt-6">
          <h2 className="font-semibold">Payouts</h2>
          <p className="mt-1 text-sm text-brand-muted">
            {user.stripeConnectReady
              ? "Your payout account is connected. You'll be paid weekly."
              : "Connect a payout account to receive weekly payouts and tips."}
          </p>
          <Link href="/account/payouts" className="btn-primary mt-3 inline-flex !px-4 !py-2 text-sm">
            {user.stripeConnectReady ? "View payout settings" : "Set up payouts"}
          </Link>
        </div>
      )}
    </div>
  );
}
