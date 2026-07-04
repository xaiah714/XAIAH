import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { subjectLabel } from "@/lib/subjects";
import { auth } from "@/auth";
import { AnswerForm } from "./answer-form";
import { ResolveButton } from "./resolve-button";
import { FlagAnswerButton } from "./flag-answer-button";
import { EndorseAnswerButton } from "./endorse-answer-button";
import { getVerificationState } from "@/lib/consensus";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      answers: {
        orderBy: [{ isVerifiedTutorAnswer: "desc" }, { createdAt: "asc" }],
        include: {
          author: { select: { name: true, role: true, tutorVerified: true } },
          endorsements: { select: { tutorId: true } },
        },
      },
    },
  });

  if (!question) notFound();

  const isAuthor = session?.user?.id === question.authorId;
  const viewerIsTutor = session?.user?.role === "TUTOR";
  const classTags = [question.courseName, question.textbookName, question.textbookEdition]
    .filter(Boolean)
    .join(" · ");

  const verification = getVerificationState(question);
  const disputeOpen = verification.kind === "DISPUTED";
  const winningAnswerId = verification.kind === "RESOLVED" ? verification.winningAnswerId : null;
  const badgeTutorCount =
    verification.kind === "VERIFIED" || verification.kind === "RESOLVED"
      ? verification.tutorCount
      : null;
  const priorVerifiedAuthorIds = new Set(
    question.answers.filter((a) => a.isVerifiedTutorAnswer).map((a) => a.authorId)
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge-community">{subjectLabel(question.subject)}</span>
        {question.secondOpinionRequested && (
          <span className="badge-verified">Second opinion requested</span>
        )}
        {badgeTutorCount !== null && (
          <span className="badge-verified">
            ✓✓ Verified by {badgeTutorCount} tutors
          </span>
        )}
      </div>
      <h1 className="mt-3 text-2xl font-bold">{question.title}</h1>
      <p className="mt-1 text-xs text-brand-muted">
        Asked by {question.author.name} ·{" "}
        {question.status === "RESOLVED" ? "Resolved" : question.status === "ANSWERED" ? "Answered" : "Open"}
      </p>
      <p className="mt-4 whitespace-pre-wrap">{question.body}</p>

      {question.photoUrls.map((url) => (
        <div key={url} className="relative mt-4 h-80 w-full overflow-hidden rounded-xl border border-brand-border">
          <Image src={url} alt="Attached work" fill className="object-contain" unoptimized />
        </div>
      ))}

      {(question.methodNotes || question.methodPhotoUrl || classTags) && (
        <div className="card mt-4 border-brand-teal">
          <h3 className="text-sm font-semibold">This student&apos;s class method</h3>
          {classTags && <p className="mt-1 text-xs text-brand-muted">{classTags}</p>}
          {question.methodNotes && (
            <p className="mt-2 whitespace-pre-wrap text-sm">{question.methodNotes}</p>
          )}
          {question.methodPhotoUrl && (
            <div className="relative mt-3 h-64 w-full overflow-hidden rounded-xl border border-brand-border">
              <Image src={question.methodPhotoUrl} alt="Class example" fill className="object-contain" unoptimized />
            </div>
          )}
        </div>
      )}

      {isAuthor && question.status === "OPEN" && question.autoEscalatedAt && (
        <div className="card mt-4 border-brand-purple text-sm">
          <p className="font-semibold text-brand-purple-dark">
            We&apos;ve escalated this to multiple verified tutors.
          </p>
          <p className="mt-1 text-brand-muted">
            This question is taking longer than we&apos;d like, so it&apos;s now flagged for a
            second opinion — more than one verified tutor will weigh in on it.
          </p>
        </div>
      )}
      {isAuthor && question.status === "OPEN" && question.delayNoticeSentAt && !question.autoEscalatedAt && (
        <div className="card mt-4 border-brand-teal text-sm">
          <p className="font-semibold">Still working on connecting you with a verified tutor.</p>
          <p className="mt-1 text-brand-muted">
            Your question is out to every available verified tutor in this subject — hang
            tight. If it stays unanswered much longer, we&apos;ll automatically route it to
            multiple verified tutors for a second opinion.
          </p>
        </div>
      )}

      {isAuthor && question.status !== "RESOLVED" && (
        <div className="mt-4">
          <ResolveButton questionId={question.id} />
        </div>
      )}

      {disputeOpen && (
        <div className="card mt-8 border-brand-purple">
          <h2 className="font-semibold text-brand-purple-dark">
            Verified tutors are reviewing a disagreement on this question
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Two verified tutors reached different answers, so this question is on the{" "}
            {subjectLabel(question.subject)} review board. It gets its verified badge once the
            subject&apos;s tutors reach consensus — no badge is shown until then.
          </p>
        </div>
      )}

      {question.aiSynthesis && (
        <div className="card mt-8 border-brand-purple">
          <h2 className="font-semibold text-brand-purple-dark">
            AI-simplified summary (of verified tutor answers)
          </h2>
          <p className="mt-1 text-xs text-brand-muted">
            Generated by combining the verified answers below — not a new answer of its own.
          </p>
          <p className="mt-3 whitespace-pre-wrap">{question.aiSynthesis}</p>
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold">
        {question.answers.length} {question.answers.length === 1 ? "Answer" : "Answers"}
      </h2>

      <ul className="mt-4 flex flex-col gap-4">
        {question.answers.map((a) => {
          const alreadyEndorsed = Boolean(
            session?.user && a.endorsements.some((e) => e.tutorId === session.user!.id)
          );
          return (
            <li
              key={a.id}
              className={`card ${a.id === winningAnswerId ? "border-brand-teal" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={a.isVerifiedTutorAnswer ? "badge-verified" : "badge-community"}>
                    {a.isVerifiedTutorAnswer ? "Verified tutor" : "Community"}
                  </span>
                  {a.id === winningAnswerId && (
                    <span className="badge-verified">✓ Consensus answer</span>
                  )}
                  {a.agreesWithPrior === true && (
                    <span className="text-xs text-brand-muted">
                      Agrees with the earlier verified answer
                    </span>
                  )}
                  {a.agreesWithPrior === false && (
                    <span className="text-xs font-medium text-brand-purple-dark">
                      Disagrees with the earlier verified answer
                    </span>
                  )}
                </div>
                <span className="text-xs text-brand-muted">{a.author.name}</span>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-brand-muted">Reasoning</p>
                <p className="whitespace-pre-wrap text-sm">{a.reasoning}</p>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-brand-muted">Final answer</p>
                <p className="whitespace-pre-wrap font-medium">{a.body}</p>
              </div>
              {a.isVerifiedTutorAnswer && a.endorsements.length > 0 && (
                <p className="mt-2 text-xs text-brand-muted">
                  ✓ Backed by {a.endorsements.length + 1} verified tutor
                  {a.endorsements.length + 1 === 1 ? "" : "s"} (author included)
                </p>
              )}
              {session?.user && session.user.id !== a.authorId && (
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {viewerIsTutor && a.isVerifiedTutorAnswer && (
                    <EndorseAnswerButton answerId={a.id} alreadyEndorsed={alreadyEndorsed} />
                  )}
                  <FlagAnswerButton answerId={a.id} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {session?.user ? (
        <div className="card mt-6">
          <h3 className="font-semibold">Add an answer</h3>
          <div className="mt-3">
            <AnswerForm
              questionId={question.id}
              requireStance={
                viewerIsTutor &&
                !disputeOpen &&
                [...priorVerifiedAuthorIds].some((authorId) => authorId !== session.user!.id)
              }
              disputeOpen={disputeOpen}
            />
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-brand-muted">Log in to answer this question.</p>
      )}
    </div>
  );
}
