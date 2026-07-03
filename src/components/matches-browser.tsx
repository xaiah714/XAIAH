"use client";

import { useMemo, useState } from "react";
import { AwardType, DemographicTag } from "@prisma/client";
import type { ClientMatch } from "@/lib/client-types";
import { isQuickWin } from "@/lib/client-types";
import { AWARD_TYPE_LABELS, DEMOGRAPHIC_TAG_GROUPS } from "@/lib/taxonomy";
import ScholarshipCard from "@/components/scholarship-card";

const AWARD_TYPE_OPTIONS: (AwardType | "ALL")[] = ["ALL", "SCHOLARSHIP", "GRANT", "FELLOWSHIP"];

export default function MatchesBrowser({ matches }: { matches: ClientMatch[] }) {
  const [awardType, setAwardType] = useState<AwardType | "ALL">("ALL");
  const [quickWinOnly, setQuickWinOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<DemographicTag[]>([]);
  const [browsing, setBrowsing] = useState(false);

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (awardType !== "ALL" && m.scholarship.awardType !== awardType) return false;
      if (quickWinOnly && !isQuickWin(m.scholarship)) return false;
      if (selectedTags.length > 0) {
        const overlap = m.scholarship.eligibilityTags.some((t) => selectedTags.includes(t));
        if (!overlap) return false;
      }
      return true;
    });
  }, [matches, awardType, quickWinOnly, selectedTags]);

  function toggleTag(tag: DemographicTag) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  const hasActiveFilters = awardType !== "ALL" || quickWinOnly || selectedTags.length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {AWARD_TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setAwardType(type)}
              className={`min-h-[40px] rounded-full px-4 text-sm font-medium transition ${
                awardType === type
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type === "ALL" ? "All types" : AWARD_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        <label className="flex min-h-[40px] w-fit items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={quickWinOnly}
            onChange={(e) => setQuickWinOnly(e.target.checked)}
          />
          Quick wins only (no essay, or a short one)
        </label>

        <div>
          <button
            type="button"
            onClick={() => setBrowsing((b) => !b)}
            className="min-h-[40px] text-sm font-medium text-brand-700 hover:underline"
          >
            {browsing ? "Hide categories ▲" : "Browse by category ▼"}
          </button>

          {selectedTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700"
                >
                  {tag.replaceAll("_", " ").toLowerCase()} ×
                </button>
              ))}
            </div>
          )}

          {browsing && (
            <div className="mt-3 max-h-72 space-y-4 overflow-y-auto rounded-lg border border-slate-100 p-3">
              {DEMOGRAPHIC_TAG_GROUPS.map((group) => (
                <div key={group.label}>
                  <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {group.label}
                  </h4>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {group.tags.map((tag) => (
                      <label
                        key={tag.value}
                        className="flex min-h-[36px] items-center gap-2 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300"
                          checked={selectedTags.includes(tag.value)}
                          onChange={() => toggleTag(tag.value)}
                        />
                        {tag.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setAwardType("ALL");
              setQuickWinOnly(false);
              setSelectedTags([]);
            }}
            className="min-h-[36px] text-xs font-medium text-slate-500 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-sm text-slate-500">
        Showing {filtered.length} of {matches.length} matches
      </p>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          Nothing matches those filters yet — try clearing one.
        </p>
      )}

      <div className="space-y-4">
        {filtered.map((match) => (
          <ScholarshipCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
