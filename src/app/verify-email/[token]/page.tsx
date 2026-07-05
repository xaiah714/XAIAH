import Link from "next/link";
import { consumeEmailVerificationToken } from "@/lib/verification";

const COPY: Record<string, { title: string; body: string }> = {
  OK: {
    title: "Email verified",
    body: "You're all set — you now have full access.",
  },
  ALREADY_VERIFIED: {
    title: "Already verified",
    body: "This account was already confirmed.",
  },
  EXPIRED: {
    title: "Link expired",
    body: "That confirmation link is more than 24 hours old. Request a new one from the verify page.",
  },
  INVALID: {
    title: "Invalid link",
    body: "This confirmation link isn't valid. Request a new one from the verify page.",
  },
};

export default async function VerifyEmailTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await consumeEmailVerificationToken(token);
  const copy = COPY[result];

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{copy.title}</h1>
      <p className="mt-2 text-sm text-brand-muted">{copy.body}</p>
      <Link href="/dashboard" className="btn-primary mt-6 inline-flex">
        Continue
      </Link>
    </div>
  );
}
