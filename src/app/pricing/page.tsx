import Link from "next/link";
import { auth } from "@/auth";

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span className="text-brand-teal-dark">✓</span>
      <span>{children}</span>
    </li>
  );
}

export default async function PricingPage() {
  const session = await auth();
  const cta = session?.user ? "/account/subscription" : "/signup";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-center text-3xl font-bold">Simple pricing</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-brand-muted">
        Reading answers is free forever. Paying only ever buys one thing: unlimited live
        1-on-1 chat with verified tutors.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {/* Free */}
        <div className="card flex flex-col">
          <p className="font-semibold">Free</p>
          <p className="mt-1 text-3xl font-bold">
            $0<span className="text-sm font-normal text-brand-muted"> forever</span>
          </p>
          <ul className="mt-4 flex flex-1 flex-col gap-2">
            <Check>Read every verified answer — the full answer bank, no unlock fees</Check>
            <Check>Ask unlimited questions</Check>
            <Check>Answers show step-by-step reasoning</Check>
            <Check>&ldquo;Verified by N tutors&rdquo; badges on cross-checked answers</Check>
            <Check>Search by topic, textbook, or course</Check>
          </ul>
          <Link href="/signup" className="btn-secondary mt-5 text-center">
            Start free
          </Link>
        </div>

        {/* Monthly */}
        <div className="card flex flex-col border-brand-teal">
          <p className="font-semibold text-brand-teal-dark">Monthly</p>
          <p className="mt-1 text-3xl font-bold">
            $5<span className="text-sm font-normal text-brand-muted">/month</span>
          </p>
          <p className="text-xs text-brand-muted">works out to ~$0.17/day</p>
          <ul className="mt-4 flex flex-1 flex-col gap-2">
            <Check>Everything in Free</Check>
            <Check>
              <strong>Unlimited</strong> 24/7 live 1-on-1 chat with verified tutors
            </Check>
            <Check>Cancel anytime</Check>
          </ul>
          <Link href={cta} className="btn-primary mt-5 text-center">
            Get unlimited chat
          </Link>
        </div>

        {/* Yearly */}
        <div className="card flex flex-col">
          <p className="font-semibold">Yearly</p>
          <p className="mt-1 text-3xl font-bold">
            $50<span className="text-sm font-normal text-brand-muted">/year</span>
          </p>
          <p className="text-xs text-brand-muted">2 months free vs. monthly</p>
          <ul className="mt-4 flex flex-1 flex-col gap-2">
            <Check>Everything in Monthly</Check>
            <Check>One payment covers the whole school year</Check>
          </ul>
          <Link href={cta} className="btn-secondary mt-5 text-center">
            Get the year
          </Link>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-xl text-center text-sm text-brand-muted">
        <strong>Just need help once?</strong> A single live session is ~$3, no subscription
        needed — you&apos;ll see the option when you start a chat. Tips go to your tutor,
        not us.
      </p>
    </div>
  );
}
