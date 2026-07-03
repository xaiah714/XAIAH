import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentStudentId } from "@/lib/session";

const schema = z.object({ completed: z.boolean() });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> },
) {
  const { id: matchId, stepId } = await params;
  const studentId = await getCurrentStudentId();
  if (!studentId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.studentId !== studentId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const step = await prisma.applicationStep.findUnique({ where: { id: stepId } });
  if (!step || step.matchId !== matchId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 422 });
  }

  const updatedStep = await prisma.applicationStep.update({
    where: { id: stepId },
    data: {
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null,
    },
  });

  // Completing the final "submit" step is the guided flow's way of moving a
  // match to SUBMITTED — but never downgrade a status that's already moved
  // further along (confirmed/under review/awarded/rejected).
  if (
    step.type === "SUBMIT" &&
    parsed.data.completed &&
    (match.status === "NOT_STARTED" || match.status === "IN_PROGRESS")
  ) {
    await prisma.match.update({
      where: { id: matchId },
      data: { status: "SUBMITTED", statusUpdatedAt: new Date() },
    });
  }

  return NextResponse.json({ step: updatedStep });
}
