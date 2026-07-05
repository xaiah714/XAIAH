import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { subjectLabel } from "@/lib/subjects";

/**
 * Public tutor profile. Two hard rules, both structural:
 *
 * 1. Trust-signal separation — platform-verified stats live in a clearly
 *    marked "Verified by TutorApp" section with check markers; everything
 *    the tutor wrote about themselves lives in a separate section labeled
 *    as self-reported, with no verification marks. The two are never mixed.
 * 2. No contact channel — the profile displays no email, no links, no
 *    social handles, and offers no message/DM action. The only way a
 *    student ever talks to this tutor is a session-scoped chat the
 *    platform routed. (There are deliberately no contact-info fields in
 *    the schema either.)
 */
export default async function TutorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tutor = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      role: true,
      photoUrl: true,
      createdAt: true,
      tutorStatus: true,
      tutorBio: true,
      tutorSubjects: true,
      tutorAvailable: true,
      ratingAverage: true,
      ratingCount: true,
      tutorSchool: true,
      tutorDegree: true,
      tutorGradYear: true,
      tutorCredentials: true,
    },
  });

  // Only vetted tutors get a public profile page at all.
  if (
    !tutor ||
    tutor.role !== "TUTOR" ||
    !tutor.tutorStatus ||
    !["TRIAL", "ACTIVE"].includes(tutor.tutorStatus)
  ) {
    notFound();
  }

  const [sessionsCompleted, verifiedAnswerCount] = await Promise.all([
    prisma.chatSession.count({ where: { tutorId: tutor.id, status: "ENDED" } }),
    prisma.answer.count({ where: { authorId: tutor.id, isVerifiedTutorAnswer: true } }),
  ]);

  const education = [
    tutor.tutorDegree,
    tutor.tutorSchool,
    tutor.tutorGradYear ? `class of ${tutor.tutorGradYear}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const hasSelfReported = Boolean(education || tutor.tutorCredentials || tutor.tutorBio);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center gap-4">
        {tutor.photoUrl ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-brand-border">
            <Image src={tutor.photoUrl} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-teal/10 text-xl font-bold text-brand-teal-dark">
            {tutor.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{tutor.name}</h1>
          <div className="mt-1 flex flex-wrap gap-1">
            {tutor.tutorSubjects.map((s) => (
              <span key={s} className="badge-community">
                {subjectLabel(s)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Platform-verified section ─────────────────────────────────── */}
      <div className="card mt-6 border-brand-teal">
        <h2 className="font-semibold text-brand-teal-dark">✓ Verified by TutorApp</h2>
        <p className="mt-1 text-xs text-brand-muted">
          These come from platform records — {tutor.name} can&apos;t edit them.
        </p>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-brand-teal-dark">✓</span>
            {tutor.tutorStatus === "ACTIVE"
              ? "Passed tutor vetting"
              : "In vetting trial period"}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand-teal-dark">✓</span>
            {sessionsCompleted} live session{sessionsCompleted === 1 ? "" : "s"} completed
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand-teal-dark">✓</span>
            {tutor.ratingCount > 0
              ? `${tutor.ratingAverage.toFixed(1)}★ average from ${tutor.ratingCount} student rating${tutor.ratingCount === 1 ? "" : "s"}`
              : "No student ratings yet"}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand-teal-dark">✓</span>
            {verifiedAnswerCount} verified answer{verifiedAnswerCount === 1 ? "" : "s"} in
            community Q&amp;A
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand-teal-dark">✓</span>
            Tutor since{" "}
            {tutor.createdAt.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </li>
        </ul>
      </div>

      {/* ── Self-reported section — visually distinct, no check marks ──── */}
      <div className="card mt-6">
        <h2 className="font-semibold">In {tutor.name}&apos;s own words</h2>
        <p className="mt-1 text-xs text-brand-muted">
          Self-reported by the tutor — not checked or verified by TutorApp.
        </p>
        {hasSelfReported ? (
          <div className="mt-3 flex flex-col gap-3 text-sm">
            {education && (
              <div>
                <p className="text-xs font-medium text-brand-muted">Education</p>
                <p>{education}</p>
              </div>
            )}
            {tutor.tutorCredentials && (
              <div>
                <p className="text-xs font-medium text-brand-muted">Background &amp; credentials</p>
                <p className="whitespace-pre-wrap">{tutor.tutorCredentials}</p>
              </div>
            )}
            {tutor.tutorBio && (
              <div>
                <p className="text-xs font-medium text-brand-muted">Bio</p>
                <p className="whitespace-pre-wrap">{tutor.tutorBio}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-brand-muted">
            {tutor.name} hasn&apos;t added background details yet.
          </p>
        )}
      </div>

      <p className="mt-6 text-xs text-brand-muted">
        Tutors and students connect only through TutorApp sessions — profiles don&apos;t include
        contact details, and that&apos;s by design.
      </p>
    </div>
  );
}
