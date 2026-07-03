import { MatchStatus } from "@prisma/client";

export const MATCH_STATUS_ORDER: MatchStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "SUBMITTED",
  "CONFIRMED_RECEIVED",
  "UNDER_REVIEW",
  "AWARDED",
  "REJECTED",
];

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  CONFIRMED_RECEIVED: "Confirmed received",
  UNDER_REVIEW: "Under review",
  AWARDED: "Awarded",
  REJECTED: "Rejected",
};
