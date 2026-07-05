import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { subjectLabel } from "@/lib/subjects";
import { ChatRoom } from "./chat-room";

export default async function ChatSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const chatSession = await prisma.chatSession.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true } },
      tutor: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!chatSession) notFound();
  if (chatSession.studentId !== user.id && chatSession.tutorId !== user.id) notFound();

  const otherPartyName =
    user.id === chatSession.studentId
      ? (chatSession.tutor?.name ?? null)
      : chatSession.student.name;

  return (
    <div className="mx-auto flex h-[calc(100vh-57px)] max-w-2xl flex-col px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="badge-community">{subjectLabel(chatSession.subject)}</span>
          <p className="mt-1 text-sm text-brand-muted">
            {chatSession.status === "WAITING" ? (
              "Waiting for a tutor to join..."
            ) : chatSession.status === "ACTIVE" ? (
              <>
                Chatting with{" "}
                {user.id === chatSession.studentId && chatSession.tutor ? (
                  <Link
                    href={`/tutors/${chatSession.tutor.id}`}
                    className="text-brand-teal-dark underline"
                    target="_blank"
                  >
                    {chatSession.tutor.name}
                  </Link>
                ) : (
                  (otherPartyName ?? "...")
                )}
              </>
            ) : (
              "Session ended"
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-hidden">
        <ChatRoom
          chatSessionId={chatSession.id}
          currentUserId={user.id}
          initialMessages={chatSession.messages}
          initialStatus={chatSession.status}
        />
      </div>
    </div>
  );
}
