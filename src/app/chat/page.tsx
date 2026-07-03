import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { subjectLabel } from "@/lib/subjects";
import { ClaimButton } from "./claim-button";

export default async function ChatListPage() {
  const user = await requireUser();

  const [mySessions, openForTutor] = await Promise.all([
    prisma.chatSession.findMany({
      where: {
        OR: [{ studentId: user.id }, { tutorId: user.id }],
      },
      orderBy: { requestedAt: "desc" },
      take: 20,
      include: { student: { select: { name: true } }, tutor: { select: { name: true } } },
    }),
    user.role === "TUTOR"
      ? prisma.chatSession.findMany({
          where: { status: "WAITING", tutorId: null },
          orderBy: { requestedAt: "asc" },
          take: 20,
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live chat</h1>
        {user.role === "STUDENT" && (
          <Link href="/chat/new" className="btn-primary !px-4 !py-2 text-sm">
            Start live chat
          </Link>
        )}
      </div>

      {user.role === "TUTOR" && openForTutor.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Open requests you can claim</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {openForTutor.map((s) => (
              <li key={s.id} className="card flex items-center justify-between">
                <span className="badge-community">{subjectLabel(s.subject)}</span>
                <ClaimButton chatSessionId={s.id} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Your sessions</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {mySessions.length === 0 && (
            <li className="card text-sm text-brand-muted">No live chat sessions yet.</li>
          )}
          {mySessions.map((s) => (
            <li key={s.id}>
              <Link href={`/chat/${s.id}`} className="card block hover:border-brand-teal">
                <div className="flex items-center justify-between gap-2">
                  <span className="badge-community">{subjectLabel(s.subject)}</span>
                  <span className="text-xs text-brand-muted">{s.status}</span>
                </div>
                <p className="mt-2 text-sm">
                  {user.role === "STUDENT"
                    ? s.tutor
                      ? `with ${s.tutor.name}`
                      : "Waiting for a tutor..."
                    : `with ${s.student.name}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
