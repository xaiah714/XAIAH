import { requireRole } from "@/lib/auth-helpers";
import { subjectLabel } from "@/lib/subjects";
import { createSubscriptionCheckoutAction } from "@/actions/payments";
import { PayPerSessionButton } from "./pay-per-session-button";

export default async function PayForChatPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  await requireRole("STUDENT");
  const { subject } = await searchParams;
  const subjectName = subject ? subjectLabel(subject) : "your subject";

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">One more step</h1>
      <p className="mt-1 text-sm text-brand-muted">
        Live chat for {subjectName} needs a subscription or a one-time payment.
        Community Q&amp;A stays free either way.
      </p>

      <div className="card mt-6">
        <h2 className="font-semibold">Unlimited membership</h2>
        <p className="mt-1 text-sm text-brand-muted">
          $5-$10/mo. Unlimited live chat and async tutor answers, no time caps.
        </p>
        <form action={createSubscriptionCheckoutAction} className="mt-3">
          <button type="submit" className="btn-primary">
            Subscribe
          </button>
        </form>
      </div>

      <div className="card mt-4">
        <h2 className="font-semibold">Just this once</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Pay per session, no subscription required.
        </p>
        <div className="mt-3">
          <PayPerSessionButton subject={subject ?? "MATH"} />
        </div>
      </div>
    </div>
  );
}
