import { getPrinciple } from "@/lib/principles";
import ProductCard from "@/components/ProductCard";

function PrincipleDetails({ principleId }) {
  const principle = getPrinciple(principleId);
  if (!principle) return null;
  return (
    <details className="principle mt-4 rounded-2xl bg-blush/25 px-4 py-3">
      <summary className="font-display text-sm font-bold text-coral-deep">
        Why this works
      </summary>
      <div className="mt-3 space-y-2.5 text-sm font-semibold leading-relaxed text-cocoa">
        <p>{principle.summary}</p>
        {principle.steps ? (
          <ol className="list-decimal space-y-1.5 pl-5">
            {principle.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        ) : null}
        {principle.options ? (
          <div className="space-y-2">
            <p>{principle.options.intro}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {principle.options.choices.map((choice) => (
                <div key={choice.label} className="rounded-xl bg-white/80 p-3">
                  <p className="font-display font-bold text-coral-deep">{choice.label}</p>
                  <p className="mt-1">{choice.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {principle.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </details>
  );
}

export default function StepCard({ step, index, activeTier }) {
  const products = step.products[activeTier] || [];
  return (
    <li className="rounded-3xl bg-white/70 p-5 shadow-card sm:p-6">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush font-display text-base font-bold"
        >
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3 className="font-display text-lg font-bold leading-snug">
              {step.title}
              {step.optional ? (
                <span className="ml-2 text-sm font-bold text-cocoa-soft/80">(optional)</span>
              ) : null}
            </h3>
            {step.frequency ? (
              <span className="rounded-full border border-blush-deep/40 bg-white px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-cocoa-soft">
                {step.frequency}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[15px] font-semibold leading-relaxed text-cocoa-soft">{step.how}</p>
        </div>
      </div>

      {!step.noProducts ? (
        products.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} activeTier={activeTier} />
            ))}
          </div>
        ) : step.emptyText ? (
          <p className="mt-4 rounded-2xl border-2 border-dashed border-blush-deep/40 p-4 text-sm font-semibold text-cocoa-soft">
            {step.emptyText}
          </p>
        ) : null
      ) : null}

      {step.principleId ? <PrincipleDetails principleId={step.principleId} /> : null}
    </li>
  );
}
