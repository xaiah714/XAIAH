import Link from "next/link";
import { DemographicTag } from "@prisma/client";
import type { ClientMatch } from "@/lib/client-types";
import { isQuickWin } from "@/lib/client-types";
import { DEMOGRAPHIC_TAG_LABELS, AWARD_TYPE_LABELS } from "@/lib/taxonomy";
import { formatAmountRange } from "@/lib/format";
import { LocalDate, LocalDeadline } from "@/components/local-date";
import StatusControl from "@/components/status-control";
import FlagButton from "@/components/flag-button";

function LegitimacyBadge({
  verified,
  lastVerifiedDate,
  flagCount,
}: {
  verified: boolean;
  lastVerifiedDate: string | null;
  flagCount: number;
}) {
  if (flagCount >= 3) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-coral-100 px-2.5 py-0.5 text-xs font-semibold text-coral-700">
        Flagged by {flagCount} students
      </span>
    );
  }
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        Verified
        {lastVerifiedDate && (
          <span className="font-normal text-emerald-600">
            · checked <LocalDate iso={lastVerifiedDate} />
          </span>
        )}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
      Unverified — pending review
    </span>
  );
}

function requirementChips(scholarship: ClientMatch["scholarship"]) {
  const chips: string[] = [];
  if (scholarship.essayRequired) {
    const count = scholarship.essayCount && scholarship.essayCount > 1 ? `${scholarship.essayCount} essays` : "Essay";
    chips.push(scholarship.essayWordCount ? `${count} (~${scholarship.essayWordCount}w)` : count);
  } else {
    chips.push("No essay");
  }
  if (scholarship.requiresTranscript) chips.push("Transcript");
  if (scholarship.recommendationLettersRequired > 0) {
    chips.push(
      `${scholarship.recommendationLettersRequired} rec letter${scholarship.recommendationLettersRequired > 1 ? "s" : ""}`,
    );
  }
  chips.push(...scholarship.otherRequirements);
  return chips;
}

export default function ScholarshipCard({ match }: { match: ClientMatch }) {
  const { scholarship } = match;
  const tagLabels = scholarship.eligibilityTags.map((t: DemographicTag) => DEMOGRAPHIC_TAG_LABELS[t]);
  const quickWin = isQuickWin(scholarship);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-brand-950">{scholarship.name}</h3>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
              {AWARD_TYPE_LABELS[scholarship.awardType]}
            </span>
            {quickWin && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Quick win
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {scholarship.orgName}
            {scholarship.schoolName && ` · ${scholarship.schoolName}`}
          </p>
        </div>
        <LegitimacyBadge
          verified={scholarship.verified}
          lastVerifiedDate={scholarship.lastVerifiedDate}
          flagCount={scholarship.flagCount}
        />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
        <div>
          <span className="font-semibold text-brand-950">
            {formatAmountRange(scholarship.amountMin, scholarship.amountMax, scholarship.currencyCode)}
          </span>
          {scholarship.renewable && <span className="ml-1 text-xs text-slate-500">(renewable)</span>}
        </div>
        <LocalDeadline iso={scholarship.deadline} />
        {scholarship.acceptanceRate != null && (
          <div className="text-slate-600">
            {Math.round(scholarship.acceptanceRate * 100)}% acceptance rate
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {requirementChips(scholarship).map((chip) => (
          <span key={chip} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {chip}
          </span>
        ))}
        {scholarship.minGpa != null && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {scholarship.minGpa}+ GPA
          </span>
        )}
        {scholarship.eligibleMajors.map((m) => (
          <span key={m} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {m}
          </span>
        ))}
        {scholarship.region && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {scholarship.region}
          </span>
        )}
        {scholarship.homeCountryEligibility.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            Open to: {scholarship.homeCountryEligibility.join(", ")}
          </span>
        )}
        {tagLabels.map((label) => (
          <span key={label} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
            {label}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
        <a
          href={scholarship.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          View official listing ↗
        </a>
        <Link
          href={`/dashboard/matches/${match.id}`}
          className="min-h-[36px] rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {match.status === "NOT_STARTED" ? "Start application" : "Continue application"}
        </Link>
      </div>

      <StatusControl
        matchId={match.id}
        status={match.status}
        confirmationUrl={match.confirmationUrl}
      />

      <FlagButton scholarshipId={scholarship.id} />
    </div>
  );
}
