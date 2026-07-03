import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Thanks!</h1>
      <p className="mt-2 text-sm text-brand-muted">
        Your feedback helps keep tutors accountable and paid fairly.
      </p>
      <Link href="/questions" className="btn-primary mt-6 inline-flex">
        Back to community
      </Link>
    </div>
  );
}
