import { prisma } from "@/lib/prisma";

// A tutor needs at least this many verified answers before flags can affect
// routing at all — a single unlucky flag on someone's first answer shouldn't
// suppress them.
const MIN_ANSWERS_FOR_STANDING = 5;
// Above this fraction of flagged verified answers, a tutor is routed fewer
// new requests instead of being silently buried behind a low star rating.
const FLAGGED_RATIO_SUPPRESSION_THRESHOLD = 0.3;

/**
 * Returns the subset of tutorIds whose flagged-answer ratio is high enough
 * that they should be excluded from new broadcast notifications. This is
 * routing suppression, not account suspension — a suppressed tutor keeps
 * their account, rating, and existing claims; they just stop receiving new
 * broadcasts until their ratio recovers.
 */
export async function getSuppressedTutorIds(tutorIds: string[]): Promise<Set<string>> {
  if (tutorIds.length === 0) return new Set();

  const answers = await prisma.answer.findMany({
    where: { authorId: { in: tutorIds }, isVerifiedTutorAnswer: true },
    select: { authorId: true, _count: { select: { flags: true } } },
  });

  const stats = new Map<string, { total: number; flagged: number }>();
  for (const a of answers) {
    const s = stats.get(a.authorId) ?? { total: 0, flagged: 0 };
    s.total += 1;
    if (a._count.flags > 0) s.flagged += 1;
    stats.set(a.authorId, s);
  }

  const suppressed = new Set<string>();
  for (const [tutorId, s] of stats) {
    if (s.total >= MIN_ANSWERS_FOR_STANDING && s.flagged / s.total > FLAGGED_RATIO_SUPPRESSION_THRESHOLD) {
      suppressed.add(tutorId);
    }
  }
  return suppressed;
}
