import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/logo";
import { DISCLAIMER, SUBTAGLINE, TAGLINE } from "@/lib/branding";

/**
 * Landing screen (spec §4.1): logo placeholder, one-line tagline,
 * a single CTA — one decision on this screen.
 */
export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <LogoMark size={88} />
        <Wordmark className="text-4xl" />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold sm:text-4xl">{TAGLINE}</h1>
        <p className="mx-auto max-w-md text-lg text-cocoa-soft">{SUBTAGLINE}</p>
      </div>

      <Link href="/quiz" className="btn-primary w-full max-w-xs">
        Take the Quiz
      </Link>

      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-cocoa-soft">
        <li>⏱️ About 2 minutes</li>
        <li>🧴 Real product picks</li>
        <li>🐰 Vegan options included</li>
      </ul>

      <p className="max-w-md text-xs leading-relaxed text-cocoa-soft/80">{DISCLAIMER}</p>
    </main>
  );
}
