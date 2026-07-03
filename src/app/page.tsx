import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Scholarship & grant discovery, actually followed through
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-brand-950 sm:text-5xl">
          Find aid you qualify for.
          <br />
          Then actually finish applying.
        </h1>
        <p className="mx-auto max-w-xl text-lg text-slate-600">
          Most sites stop at a list. We match you against verified
          scholarships and grants worldwide, show your total eligible dollar
          amount, and walk you through each application until it&apos;s done.
        </p>
      </div>
      <Link
        href="/login"
        className="inline-flex min-h-[52px] items-center rounded-full bg-accent-500 px-8 py-3 text-base font-semibold text-brand-950 shadow-sm transition hover:bg-accent-600"
      >
        Build my profile — it&apos;s free
      </Link>
      <div className="grid grid-cols-1 gap-6 pt-4 text-left sm:grid-cols-3">
        {[
          {
            title: "Matched to you",
            body: "Hard eligibility filters plus demographic overlap scoring rank scholarships and grants by real fit — or browse categories yourself.",
          },
          {
            title: "Verified listings",
            body: "Every listing shows a verification badge and last-checked date so you avoid scams.",
          },
          {
            title: "Guided applications",
            body: "Each match becomes small, doable steps with reminders in your own time zone, so deadlines don't sneak up on you.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-brand-950">{f.title}</h3>
            <p className="mt-1.5 text-sm text-slate-600">{f.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
