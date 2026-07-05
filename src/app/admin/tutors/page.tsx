import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { subjectLabel } from "@/lib/subjects";
import { TutorStatusActions } from "./tutor-status-actions";

export default async function AdminTutorsPage() {
  await requireRole("ADMIN");

  const tutors = await prisma.user.findMany({
    where: { role: "TUTOR" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Tutor vetting</h1>
      <p className="mt-1 text-sm text-brand-muted">
        Move tutors through applied &rarr; trial &rarr; active, or suspend/remove based on
        ratings.
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {tutors.map((t) => (
          <li key={t.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-brand-muted">
                  {t.email} · {t.timezone} ·{" "}
                  {t.tutorSubjects.map(subjectLabel).join(", ") || "no subjects picked yet"}
                </p>
                <p className="text-xs text-brand-muted">
                  Rating: {t.ratingAverage.toFixed(1)} ({t.ratingCount})
                </p>
              </div>
              <span className="badge-community">{t.tutorStatus}</span>
            </div>
            <div className="mt-3">
              <TutorStatusActions tutorId={t.id} currentStatus={t.tutorStatus ?? "APPLIED"} />
            </div>
          </li>
        ))}
        {tutors.length === 0 && (
          <li className="card text-sm text-brand-muted">No tutor applications yet.</li>
        )}
      </ul>
    </div>
  );
}
