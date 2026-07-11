"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isComplete } from "@/lib/quiz";
import { useQuiz } from "@/lib/quiz-context";
import { BADGES, TIERS, buildRoutine } from "@/lib/recommendations";
import type { Principle, Product, Step, TierId } from "@/lib/recommendations";
import { DISCLAIMER } from "@/lib/branding";
import { LogoMark, Wordmark } from "@/components/logo";
import { track } from "@/lib/analytics";

/**
 * Results screen (spec §4.3): routine broken into Wash Day / Daily / Nightly,
 * a 3-way product tab (all tiers pre-calculated — switching is instant and
 * client-side), personalized notes, the "why" guides, Retake Quiz, and the
 * disabled "Save My Routine" placeholder for v2 accounts.
 */
export function ResultsView() {
  const router = useRouter();
  const { answers, hydrated, reset } = useQuiz();

  const complete = hydrated && isComplete(answers);
  const result = useMemo(
    () => (complete ? buildRoutine(answers) : null),
    [complete, answers],
  );

  const [tier, setTier] = useState<TierId | null>(null);
  const activeTier: TierId = tier ?? result?.defaultTier ?? "drugstore";

  useEffect(() => {
    if (result) track("results_viewed", { concern: result.concern.id });
  }, [result]);

  if (!hydrated) {
    return <main className="min-h-dvh" aria-busy="true" />;
  }

  if (!result) {
    // Landed here without finishing the quiz (deep link / cleared storage).
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
        <LogoMark size={72} />
        <h1 className="text-2xl font-bold">Let&apos;s build your routine first</h1>
        <p className="text-cocoa-soft">
          Your results live here — take the 2-minute quiz and they&apos;ll be waiting.
        </p>
        <Link href="/quiz" className="btn-primary w-full max-w-xs">
          Take the Quiz
        </Link>
      </main>
    );
  }

  const { concern, notes, principles, chips } = result;

  function retake() {
    track("retake_clicked");
    reset();
    router.push("/quiz");
  }

  function switchTier(next: TierId) {
    setTier(next);
    track("tier_tab_switched", { tier: next });
  }

  return (
    <main className="mx-auto max-w-xl px-6 pt-8 pb-14">
      {/* Header */}
      <header className="mb-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <LogoMark size={36} />
          <Wordmark className="text-xl" />
        </div>
        <h1 className="text-3xl font-bold">{concern.resultTitle}</h1>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full bg-blush px-3 py-1 text-sm font-bold text-cocoa"
            >
              {chip}
            </li>
          ))}
        </ul>
      </header>

      {/* Product picks + 3-way tier tab */}
      <section aria-labelledby="picks-heading" className="mb-10">
        <h2 id="picks-heading" className="mb-3 text-xl font-bold">
          Your product picks
        </h2>

        <div
          role="tablist"
          aria-label="Product tier"
          className="mb-4 grid grid-cols-3 gap-1 rounded-full bg-blush p-1"
        >
          {TIERS.map((t) => {
            const selected = activeTier === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`panel-${t.id}`}
                onClick={() => switchTier(t.id)}
                className={`min-h-11 rounded-full px-1 text-xs font-bold transition sm:text-sm ${
                  selected ? "bg-card text-cocoa shadow-soft" : "text-cocoa/70 hover:text-cocoa"
                }`}
              >
                {t.id === "vegan" ? (
                  <>
                    Vegan &<br className="sm:hidden" /> Cruelty-Free
                  </>
                ) : (
                  t.label
                )}
              </button>
            );
          })}
        </div>

        {TIERS.map((t) => (
          <div
            key={t.id}
            role="tabpanel"
            id={`panel-${t.id}`}
            aria-labelledby={`tab-${t.id}`}
            hidden={activeTier !== t.id}
            className="grid gap-3"
          >
            {concern.products[t.id].map((p) => (
              <ProductCard key={p.name} product={p} />
            ))}
          </div>
        ))}
      </section>

      {/* Routine sections */}
      <section aria-labelledby="routine-heading" className="mb-10">
        <h2 id="routine-heading" className="mb-3 text-xl font-bold">
          Your routine
        </h2>
        <div className="grid gap-4">
          <RoutineCard emoji="🚿" title="Wash Day" steps={concern.washDay} />
          <RoutineCard emoji="☀️" title="Daily" steps={concern.daily} />
          <RoutineCard emoji="🌙" title="Nightly" steps={concern.nightly} />
        </div>
      </section>

      {/* Personalized notes */}
      <section aria-labelledby="notes-heading" className="mb-10">
        <h2 id="notes-heading" className="mb-3 text-xl font-bold">
          Because you told us…
        </h2>
        <div className="grid gap-3">
          {notes.map((n) => (
            <div
              key={n.id}
              className={`rounded-bubble border-2 p-4 ${
                n.tone === "warning"
                  ? "border-butter bg-butter/30"
                  : "border-line bg-card shadow-soft"
              }`}
            >
              <p className="font-bold">
                <span aria-hidden="true">{n.emoji}</span> {n.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-cocoa-soft">{n.body}</p>
              {n.principleId && (
                <a
                  href={`#principle-${n.principleId}`}
                  className="mt-2 inline-block text-sm font-bold text-coral-deep underline underline-offset-2"
                >
                  Read the full guide ↓
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Extra note (e.g. thinning lifestyle & root-cause) */}
      {concern.extraNote && (
        <section className="mb-10 rounded-bubble border-2 border-mint bg-mint/25 p-5">
          <h2 className="text-lg font-bold">{concern.extraNote.title}</h2>
          {concern.extraNote.body.map((p) => (
            <p key={p} className="mt-2 text-sm leading-relaxed">
              {p}
            </p>
          ))}
        </section>
      )}

      {/* Principle guides */}
      <section aria-labelledby="why-heading" className="mb-10">
        <h2 id="why-heading" className="mb-1 text-xl font-bold">
          The why behind it
        </h2>
        <p className="mb-3 text-sm text-cocoa-soft">
          Tap any guide for the full technique — these are the fundamentals your routine is built on.
        </p>
        <div className="grid gap-3">
          {principles.map((p) => (
            <PrincipleAccordion key={p.id} principle={p} />
          ))}
        </div>
      </section>

      {/* Actions */}
      <section className="mb-8 grid gap-3">
        <button type="button" disabled className="btn-primary" title="Coming soon">
          Save My Routine
          <span className="rounded-full bg-white/30 px-2 py-0.5 text-xs font-bold">
            Coming soon
          </span>
        </button>
        <button type="button" onClick={retake} className="btn-secondary">
          Retake Quiz
        </button>
      </section>

      <footer className="text-center text-xs leading-relaxed text-cocoa-soft/80">
        {DISCLAIMER}
      </footer>
    </main>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="rounded-bubble border-2 border-line bg-card p-4 shadow-soft">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-bold">{product.name}</p>
        {product.badges?.map((b) => (
          <span
            key={b}
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${BADGES[b].className}`}
          >
            {BADGES[b].label}
          </span>
        ))}
      </div>
      <p className="mt-1 text-sm text-cocoa-soft">{product.role}</p>
      {product.note && (
        <p className="mt-2 rounded-xl bg-blush-soft px-3 py-2 text-sm leading-relaxed">
          {product.note}
        </p>
      )}
    </div>
  );
}

function RoutineCard({
  emoji,
  title,
  steps,
}: {
  emoji: string;
  title: string;
  steps: Step[];
}) {
  return (
    <div className="rounded-bubble border-2 border-line bg-card p-5 shadow-soft">
      <h3 className="mb-3 text-lg font-bold">
        <span aria-hidden="true">{emoji}</span> {title}
      </h3>
      <ol className="grid gap-3">
        {steps.map((step) => (
          <li key={step.title} className="border-l-4 border-blush pl-3">
            <p className="font-bold">{step.title}</p>
            <p className="text-sm leading-relaxed text-cocoa-soft">{step.detail}</p>
            {step.principleId && (
              <a
                href={`#principle-${step.principleId}`}
                className="mt-1 inline-block text-sm font-bold text-coral-deep underline underline-offset-2"
              >
                Why & how ↓
              </a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function PrincipleAccordion({ principle }: { principle: Principle }) {
  return (
    <details
      id={`principle-${principle.id}`}
      className="group rounded-bubble border-2 border-line bg-card shadow-soft open:border-blush"
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 py-3 [&::-webkit-details-marker]:hidden">
        <span className="text-xl" aria-hidden="true">
          {principle.emoji}
        </span>
        <span className="flex-1">
          <span className="block font-bold">{principle.title}</span>
          <span className="block text-sm text-cocoa-soft">{principle.summary}</span>
        </span>
        <span
          aria-hidden="true"
          className="text-coral transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="space-y-3 px-5 pb-5">
        {principle.paragraphs.map((p) => (
          <p key={p} className="text-sm leading-relaxed">
            {p}
          </p>
        ))}
        {principle.steps && (
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            {principle.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        )}
        {principle.options && (
          <div className="grid gap-2">
            {principle.options.map((o) => (
              <div key={o.title} className="rounded-xl bg-blush-soft px-4 py-3">
                <p className="text-sm font-bold">{o.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-cocoa-soft">{o.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}
