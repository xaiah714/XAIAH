import Badge from "@/components/Badge";
import { buyLinks } from "@/lib/affiliates";

export default function ProductCard({ product, activeTier }) {
  const showCfNote = activeTier === "crueltyFree" && product.cfNote;
  const links = buyLinks(product);
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
      {/* buy links (rev 15) — every product goes straight to a retailer,
          affiliate-tagged once the ids in lib/affiliates.js are filled in */}
      {product.brand !== "Any brand" ? (
        <div className="no-print mt-3 flex flex-wrap gap-1.5 border-t border-blush/60 pt-2.5">
          <span className="self-center text-[10px] font-extrabold uppercase tracking-wide text-cocoa-soft">
            Buy:
          </span>
          {links.map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="rounded-full bg-butter px-2.5 py-1 text-[11px] font-extrabold text-cocoa transition hover:bg-coral"
            >
              {l.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
