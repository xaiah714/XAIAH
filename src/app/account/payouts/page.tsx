import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { createConnectOnboardingLinkAction } from "@/actions/connect";

export default async function PayoutsPage() {
  const sessionUser = await requireRole("TUTOR");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  const payouts = await prisma.payout.findMany({
    where: { tutorId: user.id },
    orderBy: { periodEnd: "desc" },
    take: 12,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Payouts</h1>

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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
