import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { subjectLabel } from "@/lib/subjects";
import { auth } from "@/auth";
import { AnswerForm } from "./answer-form";
import { ResolveButton } from "./resolve-button";

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
        include: { author: { select: { name: true, role: true, tutorVerified: true } } },
      },
    },
  });

  if (!question) notFound();

  const isAuthor = session?.user?.id === question.authorId;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <span className="badge-community">{subjectLabel(question.subject)}</span>
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

      {isAuthor && question.status !== "RESOLVED" && (
        <div className="mt-4">
          <ResolveButton questionId={question.id} />
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold">
        {question.answers.length} {question.answers.length === 1 ? "Answer" : "Answers"}
      </h2>

      <ul className="mt-4 flex flex-col gap-4">
        {question.answers.map((a) => (
          <li key={a.id} className="card">
            <div className="flex items-center justify-between">
              <span className={a.isVerifiedTutorAnswer ? "badge-verified" : "badge-community"}>
                {a.isVerifiedTutorAnswer ? "Verified tutor" : "Community"}
              </span>
              <span className="text-xs text-brand-muted">{a.author.name}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap">{a.body}</p>
          </li>
        ))}
      </ul>

      {session?.user ? (
        <div className="card mt-6">
          <h3 className="font-semibold">Add an answer</h3>
          <div className="mt-3">
            <AnswerForm questionId={question.id} />
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-brand-muted">Log in to answer this question.</p>
      )}
    </div>
  );
}
