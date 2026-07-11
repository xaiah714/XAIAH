import Badge from "@/components/Badge";

export default function ProductCard({ product, activeTier }) {
  const showCfNote = activeTier === "crueltyFree" && product.cfNote;
  return (
    <div className="flex flex-col rounded-2xl bg-white/90 p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-cocoa-soft">
          {product.brand}
        </span>
        <span className="flex shrink-0 gap-1.5">
          {product.tags && product.tags.includes("new") ? <Badge tone="butter">New</Badge> : null}
          {product.crueltyFree ? <Badge tone="mint">Cruelty-Free</Badge> : null}
        </span>
      </div>
      <p className="mt-1 font-display text-base font-bold leading-snug">{product.name}</p>
      {product.blurb ? (
        <p className="mt-1.5 text-sm font-semibold leading-relaxed text-cocoa-soft">{product.blurb}</p>
      ) : null}
      {showCfNote ? (
        <p className="mt-2 text-xs font-semibold italic text-mint-deep">{product.cfNote}</p>
      ) : null}
    </div>
  );
}
