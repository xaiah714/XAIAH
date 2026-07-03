import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const flagSchema = z.object({
  reason: z.string().trim().min(3).max(1000),
  reporterEmail: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scholarship = await prisma.scholarship.findUnique({ where: { id } });
  if (!scholarship) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = flagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 422 });
  }

  await prisma.$transaction([
    prisma.scholarshipFlag.create({
      data: {
        scholarshipId: id,
        reason: parsed.data.reason,
        reporterEmail: parsed.data.reporterEmail || undefined,
      },
    }),
    prisma.scholarship.update({
      where: { id },
      data: { flagCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
