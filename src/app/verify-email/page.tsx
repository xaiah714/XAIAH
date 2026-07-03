import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { ResendButton } from "./resend-button";

export default async function VerifyEmailPage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  if (user.emailVerified) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Check your inbox</h1>
      <p className="mt-2 text-sm text-brand-muted">
        We sent a confirmation link to <strong>{user.email}</strong>. Click it to
        unlock posting questions, live chat, and everything else.
      </p>
      <p className="mt-1 text-xs text-brand-muted">
        You can still browse community Q&amp;A while you wait.
      </p>
      <div className="mt-6">
        <ResendButton />
      </div>
    </div>
  );
}
