// Circular brand logo (rev 7) — the owner's uploaded artwork,
// circle-cropped with transparent corners. To update the branding,
// replace public/logo.webp (and app/icon.png for the favicon, plus
// scripts/logo-demo.webp for the demo build). No code changes needed.
export default function Logo({ className = "" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.webp" alt="" aria-hidden="true" className={`rounded-full ${className}`} />
  );
}
