import Link from "next/link";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Homework Answers", href: "/questions" },
      { label: "Ask a Question", href: "/questions/new" },
      { label: "Live Tutor Chat", href: "/chat" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/help#about" },
      { label: "Become a Tutor", href: "/signup" },
    ],
  },
  {
    heading: "Trust",
    links: [
      { label: "How verification works", href: "/honor-code#verification" },
      { label: "Academic Integrity", href: "/honor-code" },
      { label: "Terms", href: "/help#terms" },
      { label: "Privacy", href: "/help#privacy" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help & Contact", href: "/help" },
      { label: "Manage subscription", href: "/account/subscription" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-surface">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="text-lg font-bold text-brand-teal-dark">TutorApp</p>
          <p className="mt-2 text-sm text-brand-muted">
            Homework help verified by real tutors. Every answer free to read, always.
          </p>
          <div className="mt-3 flex gap-3 text-lg" aria-label="Social media (coming soon)">
            <span title="Instagram — coming soon" className="cursor-default opacity-50">
              📸
            </span>
            <span title="TikTok — coming soon" className="cursor-default opacity-50">
              🎵
            </span>
            <span title="YouTube — coming soon" className="cursor-default opacity-50">
              ▶️
            </span>
          </div>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
              {col.heading}
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="hover:text-brand-teal">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-brand-border">
        <p className="mx-auto max-w-5xl px-4 py-4 text-xs text-brand-muted">
          © {new Date().getFullYear()} TutorApp. Built with students, for students.
        </p>
      </div>
    </footer>
  );
}
