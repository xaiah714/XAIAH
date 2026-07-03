import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { RateForm } from "./rate-form";

export default async function RateSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const chatSession = await prisma.chatSession.findUnique({
    where: { id },
    include: { tutor: { select: { name: true } }, rating: true },
  });

  if (!chatSession || chatSession.studentId !== user.id || !chatSession.tutorId) notFound();

  if (chatSession.rating) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">You already rated this session</h1>
        <p className="mt-2 text-sm text-brand-muted">Thanks for the feedback!</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">How did it go with {chatSession.tutor?.name}?</h1>
      <div className="card mt-6">
        <RateForm chatSessionId={chatSession.id} />
      </div>
    </div>
  );
}
