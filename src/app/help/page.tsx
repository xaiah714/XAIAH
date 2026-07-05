import Link from "next/link";
import { ContactForm } from "./contact-form";

export const metadata = { title: "Help & Contact — TutorApp" };

const QUICK_LINKS = [
  { label: "How answer verification works", href: "/honor-code#verification" },
  { label: "What's free vs. paid", href: "/pricing" },
  { label: "Academic integrity / Honor Code", href: "/honor-code" },
  { label: "Become a tutor", href: "/signup" },
  { label: "Manage your subscription", href: "/account/subscription" },
  { label: "Your account & security (2FA)", href: "/account" },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Help &amp; Contact</h1>
      <p className="mt-2 text-brand-muted" id="about">
        TutorApp is homework help verified by real tutors — free to read, always, with 24/7
        live tutor chat for subscribers. Quick answers below; anything else, use the form.
      </p>

      <div className="card mt-8">
        <h2 className="font-semibold">Quick answers</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {QUICK_LINKS.map((l) => (
            <li key={l.href + l.label}>
              <Link href={l.href} className="text-brand-teal-dark underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="card mt-6">
        <h2 className="font-semibold">Contact us</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Goes straight to the people building this. We read everything.
        </p>
        <div className="mt-4">
          <ContactForm />
        </div>
      </div>

      <p className="mt-8 text-xs text-brand-muted" id="terms">
        <span id="privacy" /> Formal Terms of Service and Privacy Policy are being drafted
        with counsel before public launch — this page will link them. Until then: we don&apos;t
        sell your data, tutors never see your contact info, and payments are handled by
        Stripe.
      </p>
    </div>
  );
}
