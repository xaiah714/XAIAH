import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { getAdminMetrics } from "@/lib/metrics";
import { prisma } from "@/lib/prisma";
import { subjectLabel } from "@/lib/subjects";

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-brand-muted">{sub}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");
  const [m, openDisputes, subjectRequests] = await Promise.all([
    getAdminMetrics(),
    prisma.question.findMany({
      where: { disputedAt: { not: null }, disputeResolvedAt: null },
      orderBy: { disputedAt: "asc" },
      take: 20,
      select: { id: true, title: true, subject: true, disputedAt: true },
    }),
    prisma.subjectRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <Link href="/admin/tutors" className="btn-primary !px-4 !py-2 text-sm">
          Tutor vetting queue
        </Link>
      </div>
      <p className="mt-1 text-sm text-brand-muted">Last 30 days unless noted.</p>

      {openDisputes.length > 0 && (
        <div className="card mt-6 border-brand-purple">
          <h2 className="font-semibold text-brand-purple-dark">
            ⚑ {openDisputes.length} open tutor disagreement{openDisputes.length === 1 ? "" : "s"}
          </h2>
          <p className="mt-1 text-xs text-brand-muted">
            Informational — each is on its subject&apos;s review board and the subject&apos;s
            tutors were notified. Consensus among them resolves it; you don&apos;t need to act.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {openDisputes.map((q) => (
              <li key={q.id}>
                <Link href={`/questions/${q.id}`} className="text-sm underline">
                  [{subjectLabel(q.subject)}] {q.title}
                </Link>
                <span className="ml-2 text-xs text-brand-muted">
                  since {q.disputedAt?.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile label="Avg async response time" value={m.avgAsyncResponseTime} />
        <StatTile label="Avg live connect time" value={m.avgLiveConnectTime} />
        <StatTile
          label="Resolution rate"
          value={`${m.resolutionRatePct.toFixed(0)}%`}
          sub={`${m.totalQuestions} questions posted`}
        />
        <StatTile label="Active subscribers" value={String(m.activeSubscribers)} />
        <StatTile
          label="Live chat sessions / subscriber"
          value={m.avgSessionsPerSubscriber.toFixed(2)}
          sub="Watch this against tutor pay — unlimited usage is not capped"
        />
        <StatTile
          label="Effective tutor pay (pool)"
          value={`$${m.effectiveTutorPayPerHour.toFixed(2)}/hr`}
          sub="Target ~$7.50/hr per the spec's math — revisit the split if usage pushes this down"
        />
        <StatTile label="Monthly churn" value={`${m.churnRatePct.toFixed(1)}%`} />
        <StatTile
          label="Tip volume"
          value={`$${(m.tipVolumeCents / 100).toFixed(2)}`}
          sub={`${m.tipCount} tips, avg $${(m.avgTipCents / 100).toFixed(2)}`}
        />
      </div>

      {subjectRequests.length > 0 && (
        <div className="card mt-6">
          <h2 className="font-semibold">Requested subjects (demand signal)</h2>
          <p className="mt-1 text-xs text-brand-muted">
            Free-text subjects people asked for at signup or when posting a question — use
            this to decide what to add next.
          </p>
          <ul className="mt-3 flex flex-col gap-1 text-sm">
            {subjectRequests.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2">
                <span className="font-medium">{r.subjectName}</span>
                <span className="text-xs text-brand-muted">
                  {r.notes ?? ""} · {r.createdAt.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Tutor utilization by timezone</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {m.utilizationByTimezone.length === 0 && (
              <li className="card text-sm text-brand-muted">No tutors yet.</li>
            )}
            {m.utilizationByTimezone.map((row) => (
              <li key={row.timezone} className="card flex items-center justify-between text-sm">
                <span>{row.timezone}</span>
                <span className="text-brand-muted">
                  {row.tutors} tutors · {row.sessions} sessions
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Tutor pipeline</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {Object.entries(m.tutorStatusCounts).map(([status, count]) => (
              <li key={status} className="card flex items-center justify-between text-sm">
                <span>{status}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>

          {m.cancelReasons.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold">Recent cancellation reasons</h3>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-brand-muted">
                {m.cancelReasons.slice(0, 5).map((reason, i) => (
                  <li key={i}>&ldquo;{reason}&rdquo;</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
