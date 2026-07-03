import { DemographicTag } from "@prisma/client";
import type { MatchWithScholarship } from "@/lib/matching";
import { DEMOGRAPHIC_TAG_LABELS } from "@/lib/taxonomy";
import { formatAmountRange, formatDate, daysUntil } from "@/lib/format";
import StatusControl from "@/components/status-control";
import FlagButton from "@/components/flag-button";

function LegitimacyBadge({
  verified,
  lastVerifiedDate,
  flagCount,
}: {
  verified: boolean;
  lastVerifiedDate: Date | null;
  flagCount: number;
}) {
  if (flagCount >= 3) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
        Flagged by {flagCount} students
      </span>
    );
  }
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        Verified
        {lastVerifiedDate && (
          <span className="font-normal text-emerald-600">· checked {formatDate(lastVerifiedDate)}</span>
        )}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
      Unverified — pending review
    </span>
  );
}

export default function ScholarshipCard({ match }: { match: MatchWithScholarship }) {
  const { scholarship } = match;
  const daysLeft = daysUntil(scholarship.deadline);
  const tagLabels = scholarship.eligibilityTags.map((t: DemographicTag) => DEMOGRAPHIC_TAG_LABELS[t]);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">{scholarship.name}</h3>
          <p className="text-sm text-slate-500">{scholarship.orgName}</p>
        </div>
        <LegitimacyBadge
          verified={scholarship.verified}
          lastVerifiedDate={scholarship.lastVerifiedDate}
          flagCount={scholarship.flagCount}
        />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div>
          <span className="font-semibold text-slate-900">
            {formatAmountRange(scholarship.amountMin, scholarship.amountMax)}
          </span>
          {scholarship.renewable && <span className="ml-1 text-xs text-slate-500">(renewable)</span>}
        </div>
        <div className={daysLeft <= 14 ? "font-medium text-red-600" : "text-slate-600"}>
          Due {formatDate(scholarship.deadline)}
          {daysLeft >= 0 ? ` (${daysLeft}d left)` : " (passed)"}
        </div>
        <div className="text-slate-600">
          {scholarship.essayRequired
            ? `Essay required${scholarship.essayWordCount ? ` (~${scholarship.essayWordCount} words)` : ""}`
            : "No essay required"}
        </div>
        {scholarship.acceptanceRate != null && (
          <div className="text-slate-600">
            {Math.round(scholarship.acceptanceRate * 100)}% acceptance rate
          </div>
        )}
      </div>

      {(tagLabels.length > 0 || scholarship.minGpa || scholarship.eligibleMajors.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
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
          {tagLabels.map((label) => (
            <span key={label} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
              {label}
            </span>
          ))}
        </div>
      )}

      <a
        href={scholarship.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-block text-sm font-medium text-brand-600 hover:underline"
      >
        View official listing ↗
      </a>

      <StatusControl
        matchId={match.id}
        status={match.status}
        confirmationUrl={match.confirmationUrl}
      />

      <FlagButton scholarshipId={scholarship.id} />
    </div>
  );
}
