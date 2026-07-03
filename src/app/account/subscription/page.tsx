import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import {
  createSubscriptionCheckoutAction,
  createBillingPortalSessionAction,
} from "@/actions/payments";

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const user = await requireRole("STUDENT");
  const { success, canceled } = await searchParams;
  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });

  const isActive = subscription?.status === "ACTIVE";

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">Subscription</h1>

      {success && (
        <p className="mt-4 rounded-xl bg-brand-teal-light px-4 py-3 text-sm text-brand-teal-dark">
          You&apos;re subscribed. Live chat is unlocked.
        </p>
      )}
      {canceled && (
        <p className="mt-4 rounded-xl bg-brand-purple-light px-4 py-3 text-sm text-brand-purple-dark">
          Checkout canceled — no charge was made.
        </p>
      )}

      <div className="card mt-6">
        <h2 className="font-semibold">
          {isActive ? "You're subscribed" : "Unlimited membership — $5-$10/mo"}
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          Unlimited live chat and async tutor answers, no time caps.
          {subscription?.currentPeriodEnd &&
            ` Renews ${subscription.currentPeriodEnd.toLocaleDateString()}.`}
        </p>

        <div className="mt-4">
          {isActive ? (
            <form action={createBillingPortalSessionAction}>
              <button type="submit" className="btn-secondary">
                Manage billing
              </button>
            </form>
          ) : (
            <form action={createSubscriptionCheckoutAction}>
              <button type="submit" className="btn-primary">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-brand-muted">
        Prefer not to subscribe? You can still pay per session (~$2-$3) any time
        you start a live chat, or use free community Q&amp;A with no payment at
        all.
      </p>
    </div>
  );
}
