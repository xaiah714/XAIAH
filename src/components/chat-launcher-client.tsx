"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ChatLauncherClient({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  // Hide inside an active chat room — the launcher would cover the composer.
  if (/^\/chat\/[^/]+/.test(pathname) && !pathname.startsWith("/chat/new")) return null;

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-brand-teal px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-brand-teal-dark"
    >
      <span aria-hidden>💬</span>
      <span className="hidden sm:inline">Live tutor chat</span>
    </Link>
  );
}
