import { prisma } from "@/lib/prisma";

/**
 * Agreement/dispute model — zero AI involved, tutors are the source of truth:
 *
 * - Every verified tutor answer implicitly backs itself (1 tutor).
 * - Other verified tutors can endorse an answer ("I reviewed this and it's
 *   correct"), adding their backing to it.
 * - A tutor answering a question that already has verified answer(s) declares
 *   a stance: agrees (same conclusion, their own explanation) or disagrees.
 *   A disagreement opens a dispute (Question.disputedAt).
 * - While a dispute is open the question shows no badge and sits on the
 *   subject review board. It resolves when one answer is backed by at least
 *   MIN_CONSENSUS_BACKERS tutors AND strictly more than every other verified
 *   answer — consensus among the subject's tutor pool, not an admin ruling.
 * - Badge: "Verified by N tutors" where N is the distinct tutors backing the
 *   agreeing side (no dispute) or the winning answer (resolved dispute).
 */
export const MIN_TUTORS_FOR_BADGE = 2;
export const MIN_CONSENSUS_BACKERS = 3;

type AnswerForConsensus = {
  id: string;
  authorId: string;
  isVerifiedTutorAnswer: boolean;
  agreesWithPrior: boolean | null;
  endorsements: { tutorId: string }[];
};

type QuestionForConsensus = {
  disputedAt: Date | null;
  disputeResolvedAt: Date | null;
  answers: AnswerForConsensus[];
};

export type VerificationState =
  | { kind: "NONE" }
  | { kind: "VERIFIED"; tutorCount: number }
  | { kind: "DISPUTED" }
  | { kind: "RESOLVED"; tutorCount: number; winningAnswerId: string };

function backingCount(answer: AnswerForConsensus): number {
  const backers = new Set<string>([answer.authorId]);
  for (const e of answer.endorsements) backers.add(e.tutorId);
  return backers.size;
}

/** Pure computation over already-loaded question data (no queries). */
export function getVerificationState(question: QuestionForConsensus): VerificationState {
  const verified = question.answers.filter((a) => a.isVerifiedTutorAnswer);
  if (verified.length === 0) return { kind: "NONE" };

  if (question.disputedAt && !question.disputeResolvedAt) return { kind: "DISPUTED" };

  if (question.disputedAt && question.disputeResolvedAt) {
    const ranked = [...verified].sort((a, b) => backingCount(b) - backingCount(a));
    const winner = ranked[0];
    return { kind: "RESOLVED", tutorCount: backingCount(winner), winningAnswerId: winner.id };
  }

  // Never disputed: everyone participating is on one agreeing side.
  const tutors = new Set<string>();
  for (const a of verified) {
    tutors.add(a.authorId);
    for (const e of a.endorsements) tutors.add(e.tutorId);
  }
  if (tutors.size >= MIN_TUTORS_FOR_BADGE) {
    return { kind: "VERIFIED", tutorCount: tutors.size };
  }
  return { kind: "NONE" };
}

/**
 * Re-checks an open dispute after a new endorsement or answer; marks it
 * resolved once one answer has >= MIN_CONSENSUS_BACKERS backers and strictly
 * more than every other verified answer. Returns true if it resolved now.
 */
export async function checkDisputeResolution(questionId: string): Promise<boolean> {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      disputedAt: true,
      disputeResolvedAt: true,
      answers: {
        where: { isVerifiedTutorAnswer: true },
        select: {
          id: true,
          authorId: true,
          isVerifiedTutorAnswer: true,
          agreesWithPrior: true,
          endorsements: { select: { tutorId: true } },
        },
      },
    },
  });
  if (!question || !question.disputedAt || question.disputeResolvedAt) return false;

  const counts = question.answers.map((a) => backingCount(a)).sort((a, b) => b - a);
  const [top, second = 0] = counts;
  if (top >= MIN_CONSENSUS_BACKERS && top > second) {
    await prisma.question.update({
      where: { id: questionId },
      data: { disputeResolvedAt: new Date() },
    });
    return true;
  }
  return false;
}
