"use client";

export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-display text-sm font-bold text-cocoa-soft">
          Question {current} of {total}
        </span>
        <span className="text-xs font-bold text-cocoa-soft/70">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={`Question ${current} of ${total}`}
        className="h-3 w-full overflow-hidden rounded-full bg-blush/50"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-blush-deep to-coral transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
