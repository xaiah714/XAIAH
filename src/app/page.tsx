import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 pt-16 pb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Stuck at 3 AM? A real tutor is awake somewhere.
        </h1>
        <p className="mt-4 text-lg text-brand-muted">
          Live, human tutoring across math, science, CS, nursing, and more —
          for a fraction of what other answer sites charge. Community help is
          always free. Nobody is ever blocked from getting help because they
          can&apos;t pay.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/signup" className="btn-primary w-full sm:w-auto">
            Ask a question — it&apos;s free
          </Link>
          <Link href="/questions" className="btn-secondary w-full sm:w-auto">
            Browse community answers
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card">
            <div className="badge-community mb-3">Free, always</div>
            <h2 className="text-lg font-semibold">Community Q&amp;A</h2>
            <p className="mt-2 text-sm text-brand-muted">
              Post a question with text or a photo of your work. No caps, no
              paywall, ever.
            </p>
          </div>
          <div className="card">
            <div className="badge-verified mb-3">Verified tutors</div>
            <h2 className="text-lg font-semibold">Live chat, day or night</h2>
            <p className="mt-2 text-sm text-brand-muted">
              Matched by subject and timezone, so someone awake in another
              part of the world can help right now.
            </p>
          </div>
          <div className="card">
            <div className="badge-verified mb-3">~half the price</div>
            <h2 className="text-lg font-semibold">Unlimited for $5-$10/mo</h2>
            <p className="mt-2 text-sm text-brand-muted">
              Or pay per session with no subscription. Tip your tutor
              directly when they help you out.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
