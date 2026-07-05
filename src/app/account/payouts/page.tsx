import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { createConnectOnboardingLinkAction } from "@/actions/connect";
import { daysUntil } from "@/lib/dates";
import { MarkPayoutNotificationsReadButton } from "./mark-notifications-read-button";

const NOTIFICATION_COPY: Record<string, (amount: string) => string> = {
  PAYOUT_HELD: (amount) =>
    `${amount} held — connect a payout account within 30 days to claim it.`,
  PAYOUT_REMINDER: (amount) =>
    `Reminder: ${amount} held for you is expiring soon. Connect payouts to claim it.`,
  PAYOUT_RELEASED: (amount) => `${amount} paid out.`,
  PAYOUT_EXPIRED: (amount) =>
    `${amount} expired unclaimed after 30 days and went back into the tutor pool.`,
};

export default async function PayoutsPage() {
  const sessionUser = await requireRole("TUTOR");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  const [payouts, held, payoutNotifications] = await Promise.all([
    prisma.payout.findMany({
      where: { tutorId: user.id },
      orderBy: { periodEnd: "desc" },
      take: 12,
    }),
    prisma.payout.findMany({
      where: { tutorId: user.id, status: "HELD" },
      orderBy: { holdExpiresAt: "asc" },
    }),
    prisma.notification.findMany({
      where: {
        userId: user.id,
        type: { in: ["PAYOUT_HELD", "PAYOUT_REMINDER", "PAYOUT_RELEASED", "PAYOUT_EXPIRED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { payout: { select: { amountCents: true } } },
    }),
  ]);

  const heldTotalCents = held.reduce((sum, p) => sum + p.amountCents, 0);
  const soonestExpiry = held[0]?.holdExpiresAt ?? null;
  const daysUntilExpiry = soonestExpiry ? daysUntil(soonestExpiry) : null;

  const unreadNotificationCount = payoutNotifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Payouts</h1>

      {heldTotalCents > 0 && (
        <div className="card mt-6 border-brand-purple">
          <h2 className="font-semibold text-brand-purple-dark">
            ${(heldTotalCents / 100).toFixed(2)} held for you
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            You&apos;ve earned this, but it can&apos;t be paid out until you connect a payout
            account.
            {daysUntilExpiry !== null &&
              ` The oldest hold expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"} — connect before then to claim it.`}
          </p>
        </div>
      )}

      <div className="card mt-6">
        <h2 className="font-semibold">Payout account</h2>
        <p className="mt-1 text-sm text-brand-muted">
          {user.stripeConnectReady
            ? "Connected. You're paid automatically every week for tips and your share of subscription/session revenue."
            : "Connect a payout account (via Stripe) to start receiving weekly payouts and tips."}
        </p>
        <form action={createConnectOnboardingLinkAction} className="mt-3">
          <button type="submit" className="btn-primary">
            {user.stripeConnectReady ? "Update payout details" : "Connect payout account"}
          </button>
        </form>
      </div>

      {payoutNotifications.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Payout updates {unreadNotificationCount > 0 && `(${unreadNotificationCount} unread)`}
            </h2>
            {unreadNotificationCount > 0 && <MarkPayoutNotificationsReadButton />}
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {payoutNotifications.map((n) => {
              const amount = n.payout ? `$${(n.payout.amountCents / 100).toFixed(2)}` : "An amount";
              const copy = NOTIFICATION_COPY[n.type]?.(amount) ?? "Payout update";
              return (
                <li
                  key={n.id}
                  className={`card text-sm ${n.read ? "opacity-60" : "border-brand-purple"}`}
                >
                  {copy}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Payout history</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {payouts.length === 0 && (
            <li className="card text-sm text-brand-muted">No payouts yet.</li>
          )}
          {payouts.map((p) => (
            <li key={p.id} className="card text-sm">
              <div className="flex items-center justify-between">
                <span>
                  {p.periodStart.toLocaleDateString()} - {p.periodEnd.toLocaleDateString()}
                </span>
                <span className="font-semibold">${(p.amountCents / 100).toFixed(2)}</span>
                <span className="text-brand-muted">{p.status}</span>
              </div>
              <p className="mt-1 text-xs text-brand-muted">
                Subscription pool ${(p.poolCents / 100).toFixed(2)} · Pay-per-session $
                {(p.directCents / 100).toFixed(2)} · Tips ${(p.tipCents / 100).toFixed(2)}
              </p>
              {p.status === "HELD" && p.holdExpiresAt && (
                <p className="mt-1 text-xs text-brand-purple-dark">
                  Expires {p.holdExpiresAt.toLocaleDateString()}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
