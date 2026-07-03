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
  homeCountryEligibility: string[];
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

/** No essay, or a short one — shown as an informational badge on cards, never used to rank matches. */
export function isQuickWin(s: Pick<ClientScholarship, "essayRequired" | "essayWordCount">) {
  return !s.essayRequired || (s.essayWordCount != null && s.essayWordCount <= 300);
}

export const ESSAY_LENGTH_OPTIONS = [
  { value: "ANY", label: "Any essay length" },
  { value: "NONE", label: "No essay" },
  { value: "SHORT", label: "Quick win (≤300 words)" },
  { value: "LONG", label: "Long-form (1500+ words)" },
] as const;

export type EssayLengthFilter = (typeof ESSAY_LENGTH_OPTIONS)[number]["value"];

/**
 * Purely a display filter students opt into — the matching engine never
 * factors essay length into scoring or ranking, so students who prefer
 * substantial essays can surface those just as easily as quick wins.
 */
export function matchesEssayLength(
  s: Pick<ClientScholarship, "essayRequired" | "essayWordCount">,
  filter: EssayLengthFilter,
): boolean {
  switch (filter) {
    case "ANY":
      return true;
    case "NONE":
      return !s.essayRequired;
    case "SHORT":
      return s.essayRequired && s.essayWordCount != null && s.essayWordCount <= 300;
    case "LONG":
      return s.essayRequired && s.essayWordCount != null && s.essayWordCount >= 1500;
  }
}
