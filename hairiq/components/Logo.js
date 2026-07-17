// Circular brand logo (rev 7). To rebrand the whole site, replace
// public/logo.svg with the real logo file (any square image works — it
// renders inside a circle) and app/icon.svg for the favicon. No code
// changes needed anywhere else.
export default function Logo({ className = "" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.svg" alt="" aria-hidden="true" className={`rounded-full ${className}`} />
  );
}
