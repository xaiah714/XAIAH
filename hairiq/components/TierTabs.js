"use client";

import { TIER_KEYS, TIER_META } from "@/lib/products";

// 3-way tab — all tiers are pre-calculated, switching is instant (spec §4).
export default function TierTabs({ activeTier, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Product tier"
      className="flex w-full gap-1.5 rounded-full border border-blush-deep/30 bg-white p-1.5 shadow-card"
    >
      {TIER_KEYS.map((key) => {
        const meta = TIER_META[key];
        const active = key === activeTier;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(key)}
            className={`min-h-11 flex-1 whitespace-nowrap rounded-full px-1 py-2.5 font-display text-[10px] font-extrabold uppercase leading-tight tracking-wide transition active:scale-95 sm:px-2 sm:text-sm ${
              active ? "bg-cocoa text-cream shadow-card" : "text-cocoa-soft hover:bg-blush/40"
            }`}
          >
            <span aria-hidden="true" className="mr-1 hidden sm:inline">
              {meta.emoji}
            </span>
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
