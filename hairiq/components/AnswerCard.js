"use client";

// Big tappable answer card — not a tiny radio button (spec section 4).
export default function AnswerCard({ option, selected, multiSelect, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-4 rounded-3xl border-2 bg-white/90 p-5 text-left shadow-card transition active:scale-[0.98] ${
        selected
          ? "border-coral-deep bg-blush/40"
          : "border-transparent hover:border-blush-deep/60"
      }`}
    >
      {option.emoji ? (
        <span aria-hidden="true" className="text-2xl">
          {option.emoji}
        </span>
      ) : null}
      <span className="flex-1">
        <span className="block font-display text-lg font-bold leading-snug">{option.label}</span>
        {option.sublabel ? (
          <span className="mt-0.5 block text-sm font-semibold text-cocoa-soft">{option.sublabel}</span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className={`flex h-7 w-7 shrink-0 items-center justify-center border-2 text-sm font-black text-cocoa transition ${
          multiSelect ? "rounded-lg" : "rounded-full"
        } ${selected ? "border-coral-deep bg-coral" : "border-blush-deep/50 bg-white"}`}
      >
        {selected ? "✓" : ""}
      </span>
    </button>
  );
}
