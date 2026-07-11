import { APP_NAME } from "@/lib/branding";

/**
 * Logo placeholder (spec §8: real logo/wordmark TBD).
 * A soft coral-to-pink droplet with a wave through it — swap this whole
 * component for the real mark when it exists.
 */
export function LogoMark({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${APP_NAME} logo`}
    >
      <defs>
        <linearGradient id="hairiq-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFAB91" />
          <stop offset="100%" stopColor="#FFD1DC" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#hairiq-grad)" />
      <path
        d="M14 36c6-8 10-8 15-2s9 6 15-2"
        fill="none"
        stroke="#FFF9F4"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="20" r="4" fill="#FFF9F4" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-heading font-bold tracking-tight text-cocoa ${className}`}>
      {APP_NAME}
    </span>
  );
}
