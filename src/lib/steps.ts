import { ApplicationStepType, Scholarship } from "@prisma/client";
import { prisma } from "@/lib/db";

function buildStepPlan(scholarship: Scholarship): { type: ApplicationStepType; label: string }[] {
  const steps: { type: ApplicationStepType; label: string }[] = [];

  if (scholarship.essayRequired) {
    const count = scholarship.essayCount && scholarship.essayCount > 1 ? scholarship.essayCount : 1;
    const words = scholarship.essayWordCount ? ` (~${scholarship.essayWordCount} words${count > 1 ? " each" : ""})` : "";
    steps.push({
      type: "ESSAY",
      label: count > 1 ? `Write your ${count} essays${words}` : `Write your essay${words}`,
    });
  }

  if (scholarship.requiresTranscript) {
    steps.push({ type: "TRANSCRIPT", label: "Get your transcript ready" });
  }

  if (scholarship.recommendationLettersRequired > 0) {
    const n = scholarship.recommendationLettersRequired;
    steps.push({ type: "REC_LETTER", label: `Line up ${n} recommendation letter${n > 1 ? "s" : ""}` });
  }

  if (scholarship.awardType === "GRANT") {
    steps.push({ type: "FAFSA", label: "Confirm your FAFSA (or country equivalent) is current" });
  }

  if (scholarship.otherRequirements.length > 0) {
    steps.push({ type: "OTHER", label: scholarship.otherRequirements.join("; ") });
  }

  steps.push({ type: "SUBMIT", label: "Submit your application" });

  return steps;
}

/**
 * Creates the guided walkthrough steps for a match the first time it's
 * opened, and bumps NOT_STARTED -> IN_PROGRESS — opening the walkthrough is
 * what "starting" an application means in this product.
 */
export async function ensureApplicationSteps(matchId: string) {
  const existing = await prisma.applicationStep.findMany({
    where: { matchId },
    orderBy: { order: "asc" },
  });
  if (existing.length > 0) return existing;

  const match = await prisma.match.findUniqueOrThrow({
    where: { id: matchId },
    include: { scholarship: true },
  });

  const plan = buildStepPlan(match.scholarship);

  const created = await prisma.$transaction(
    plan.map((step, i) =>
      prisma.applicationStep.create({
        data: { matchId, type: step.type, label: step.label, order: i },
      }),
    ),
  );

  if (match.status === "NOT_STARTED") {
    await prisma.match.update({ where: { id: matchId }, data: { status: "IN_PROGRESS" } });
  }

  return created;
}
