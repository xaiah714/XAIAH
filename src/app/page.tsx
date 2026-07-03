import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Scholarship discovery, actually followed through
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Find scholarships you qualify for.
          <br />
          Then actually finish applying.
        </h1>
        <p className="mx-auto max-w-xl text-lg text-slate-600">
          Most sites stop at a list. We match you against verified
          scholarships, show your total eligible dollar amount, and keep you
          on track with deadline reminders until you submit.
        </p>
      </div>
      <Link
        href="/profile"
        className="rounded-full bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        Build my profile — it's free
      </Link>
      <div className="grid grid-cols-1 gap-6 pt-8 text-left sm:grid-cols-3">
        {[
          {
            title: "Matched to you",
            body: "Hard eligibility filters plus demographic overlap scoring rank scholarships by real fit.",
          },
          {
            title: "Verified listings",
            body: "Every scholarship shows a verification badge and last-checked date so you avoid scams.",
          },
          {
            title: "Deadline tracking",
            body: "SMS reminders at 30/14/3 days, plus renewal nudges, so awards don't slip through the cracks.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
