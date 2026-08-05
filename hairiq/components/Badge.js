// Small pastel badges — yellow/green stay accent-only (spec section 3).
const STYLES = {
  mint: "bg-mint text-mint-deep",
  butter: "bg-butter text-cocoa",
  blush: "bg-blush text-cocoa",
};

export default function Badge({ tone = "blush", children }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${STYLES[tone] || STYLES.blush}`}
    >
      {children}
    </span>
  );
}
