import { AwardType, DemographicTag, MatchStatus } from "@prisma/client";

// Plain, JSON-serializable shapes for passing match/scholarship data from
// server components down into client components (dates as ISO strings).
export type ClientScholarship = {
  id: string;
  name: string;
  orgName: string;
  description: string | null;
  awardType: AwardType;
  amountMin: number;
  amountMax: number;
  currencyCode: string;
  deadline: string;
  renewable: boolean;
  essayRequired: boolean;
  essayCount: number | null;
  essayWordCount: number | null;
  requiresTranscript: boolean;
  recommendationLettersRequired: number;
  otherRequirements: string[];
  eligibilityTags: DemographicTag[];
  minGpa: number | null;
  eligibleMajors: string[];
  eligibleCountries: string[];
  region: string | null;
  schoolName: string | null;
  sourceUrl: string;
  verified: boolean;
  lastVerifiedDate: string | null;
  legitimacyScore: number | null;
  acceptanceRate: number | null;
  flagCount: number;
};

export type ClientMatch = {
  id: string;
  matchScore: number;
  status: MatchStatus;
  confirmationUrl: string | null;
  scholarship: ClientScholarship;
};

/** No essay, or a short one — the "I could knock this out tonight" filter. */
export function isQuickWin(s: Pick<ClientScholarship, "essayRequired" | "essayWordCount">) {
  return !s.essayRequired || (s.essayWordCount != null && s.essayWordCount <= 300);
}
