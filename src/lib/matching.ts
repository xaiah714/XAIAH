import { Student, Scholarship } from "@prisma/client";
import { prisma } from "@/lib/db";

const BASE_SCORE = 40;
const TAG_OVERLAP_WEIGHT = 12;
const MAX_SCORE = 100;

export function scholarshipMidpointAmount(s: Pick<Scholarship, "amountMin" | "amountMax">) {
  return Math.round((s.amountMin + s.amountMax) / 2);
}

/**
 * Hard eligibility filters. Unknown student fields (not yet disclosed) are
 * given the benefit of the doubt rather than disqualified, since we can't
 * confirm a criterion is actually unmet.
 */
export function passesHardFilters(student: Student, scholarship: Scholarship): boolean {
  if (scholarship.minGpa != null && student.gpa != null && student.gpa < scholarship.minGpa) {
    return false;
  }

  if (scholarship.eligibleStates.length > 0 && student.state) {
    if (!scholarship.eligibleStates.includes(student.state)) return false;
  }

  if (scholarship.eligibleMajors.length > 0 && student.major) {
    const studentMajor = student.major.trim().toLowerCase();
    const matches = scholarship.eligibleMajors.some(
      (m) => m.toLowerCase() === studentMajor || studentMajor.includes(m.toLowerCase()),
    );
    if (!matches) return false;
  }

  return true;
}

/**
 * Soft score: scholarships open to everyone still score above zero (BASE_SCORE)
 * once they pass hard filters; each overlapping self-disclosed demographic tag
 * adds weight so multi-category students rank higher, capped at MAX_SCORE.
 */
export function computeMatchScore(student: Student, scholarship: Scholarship): number {
  const overlap = scholarship.eligibilityTags.filter((tag) =>
    student.demographics.includes(tag),
  ).length;
  return Math.min(MAX_SCORE, BASE_SCORE + overlap * TAG_OVERLAP_WEIGHT);
}

/** Display/ranking order: fit quality x award amount, biggest opportunities first. */
export function rankingValue(matchScore: number, scholarship: Scholarship): number {
  return matchScore * scholarshipMidpointAmount(scholarship);
}

/**
 * Recomputes eligibility + score for a student against the full scholarship
 * catalog and upserts Match rows. Existing status/progress on a match is
 * preserved; only the score is refreshed. Matches for scholarships that no
 * longer pass hard filters are left as-is (a student who already started an
 * application shouldn't lose their tracked progress because, say, they later
 * added a GPA that happens to miss a cutoff).
 */
export async function syncMatchesForStudent(studentId: string) {
  const student = await prisma.student.findUniqueOrThrow({ where: { id: studentId } });
  const scholarships = await prisma.scholarship.findMany();

  const eligible = scholarships.filter((s) => passesHardFilters(student, s));

  await Promise.all(
    eligible.map((scholarship) => {
      const matchScore = computeMatchScore(student, scholarship);
      return prisma.match.upsert({
        where: { studentId_scholarshipId: { studentId, scholarshipId: scholarship.id } },
        create: { studentId, scholarshipId: scholarship.id, matchScore },
        update: { matchScore },
      });
    }),
  );

  return eligible.length;
}

export type MatchWithScholarship = Awaited<ReturnType<typeof getStudentMatches>>[number];

/** Matches for a student, joined with scholarship data, ranked for display. */
export async function getStudentMatches(studentId: string) {
  const matches = await prisma.match.findMany({
    where: { studentId },
    include: { scholarship: true },
  });

  return matches.sort(
    (a, b) => rankingValue(b.matchScore, b.scholarship) - rankingValue(a.matchScore, a.scholarship),
  );
}

/** Headline dollar-value hook: sum of award amounts for scholarships still live (not rejected). */
export function totalEligibleAmount(matches: MatchWithScholarship[]): number {
  return matches
    .filter((m) => m.status !== "REJECTED")
    .reduce((sum, m) => sum + scholarshipMidpointAmount(m.scholarship), 0);
}
