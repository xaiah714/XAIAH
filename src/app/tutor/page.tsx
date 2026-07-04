import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { subjectLabel } from "@/lib/subjects";
import { gradeLevelLabel } from "@/lib/grade-levels";
import { TutorProfileForm } from "./tutor-profile-form";
import { AvailabilityToggle } from "./availability-toggle";
import { MarkAllReadButton } from "./mark-all-read-button";

const STATUS_COPY: Record<string, string> = {
  APPLIED: "Your application is in the vetting queue. An admin will review it shortly.",
  TRIAL: "You're in your trial period — keep an eye on your ratings.",
  ACTIVE: "You're live! Students can match with you for live chat and community answers.",
  SUSPENDED: "Your account is suspended pending review.",
  REMOVED: "Your tutor account has been removed.",
};

export default async function TutorHubPage() {
  const sessionUser = await requireRole("TUTOR");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  const [notifications, openQuestions] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id, type: { in: ["NEW_QUESTION", "NEW_CHAT_REQUEST"] } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        question: { select: { title: true, author: { select: { gradeLevel: true } } } },
        chatSession: { select: { student: { select: { gradeLevel: true } } } },
      },
    }),
    user.tutorSubjects.length
      ? prisma.question.findMany({
          where: { subject: { in: user.tutorSubjects }, status: { in: ["OPEN", "ANSWERED"] } },
          orderBy: { createdAt: "asc" },
          take: 20,
          include: { _count: { select: { answers: true } } },
        })
      : Promise.resolve([]),
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const canGoLive = user.tutorStatus === "ACTIVE";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Tutor hub</h1>

      <div className="card mt-4">
        <p className="text-sm">{STATUS_COPY[user.tutorStatus ?? "APPLIED"]}</p>
        {canGoLive && (
          <div className="mt-3">
            <AvailabilityToggle available={user.tutorAvailable} />
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              New requests {unreadCount > 0 && `(${unreadCount} unread)`}
            </h2>
            {unreadCount > 0 && <MarkAllReadButton />}
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {notifications.map((n) => {
              const grade = gradeLevelLabel(
                n.question?.author.gradeLevel ?? n.chatSession?.student.gradeLevel
              );
              const href =
                n.type === "NEW_QUESTION" && n.questionId
                  ? `/questions/${n.questionId}`
                  : "/chat";

              return (
                <li key={n.id}>
                  <Link
                    href={href}
                    className={`card block hover:border-brand-teal ${n.read ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge-community">{subjectLabel(n.subject ?? "OTHER")}</span>
                      <span className="text-xs text-brand-muted">Grade level: {grade}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium">
                      {n.type === "NEW_QUESTION"
                        ? (n.question?.title ?? "A new community question")
                        : "New live chat request"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="card mt-8">
        <h2 className="font-semibold">Your subjects &amp; bio</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Batch mode below only shows questions in subjects you pick here.
        </p>
        <div className="mt-3">
          <TutorProfileForm bio={user.tutorBio ?? ""} subjects={user.tutorSubjects} />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Batch mode: unanswered questions</h2>
        <Link href="/chat" className="text-sm font-medium text-brand-teal hover:underline">
          Live chat queue &rarr;
        </Link>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {openQuestions.length === 0 && (
          <li className="card text-sm text-brand-muted">
            Nothing waiting in your subjects right now.
          </li>
        )}
        {openQuestions.map((q) => (
          <li key={q.id}>
            <Link href={`/questions/${q.id}`} className="card block hover:border-brand-teal">
              <div className="flex items-center justify-between gap-2">
                <span className="badge-community">{subjectLabel(q.subject)}</span>
                <span className="text-xs text-brand-muted">{q._count.answers} answers so far</span>
              </div>
              <h3 className="mt-2 font-semibold">{q.title}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
