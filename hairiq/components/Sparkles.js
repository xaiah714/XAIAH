// Ambient sparkles (rev 10) — nine tiny white four-point stars, fixed
// around the viewport edges (never over the content column), gently
// twinkling via CSS only. Low opacity, pointer-events none, hidden from
// screen readers, and static under prefers-reduced-motion — magic
// without distraction or a mobile perf cost.
const SPOTS = [
  { top: "6%", left: "7%", size: 14, delay: 0 },
  { top: "13%", right: "9%", size: 10, delay: 1.1 },
  { top: "30%", left: "3%", size: 8, delay: 2.3 },
  { top: "44%", right: "4%", size: 12, delay: 0.6 },
  { top: "62%", left: "5%", size: 10, delay: 1.8 },
  { top: "71%", right: "7%", size: 14, delay: 2.9 },
  { top: "86%", left: "10%", size: 9, delay: 0.9 },
  { top: "92%", right: "13%", size: 11, delay: 2.0 },
  { top: "22%", left: "14%", size: 7, delay: 3.4 },
];

function Star({ size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="white">
      <path d="M12 0c.6 7.4 4.6 11.4 12 12-7.4.6-11.4 4.6-12 12-.6-7.4-4.6-11.4-12-12C7.4 11.4 11.4 7.4 12 0Z" />
    </svg>
  );
}

export default function Sparkles() {
  return (
    <div aria-hidden="true" className="sparkles">
      {SPOTS.map((s, i) => (
        <span
          key={i}
          className="sparkle"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            animationDelay: `${s.delay}s`,
          }}
        >
          <Star size={s.size} />
        </span>
      ))}
    </div>
  );
}
