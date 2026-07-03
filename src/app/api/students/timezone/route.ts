import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentStudentId } from "@/lib/session";

const schema = z.object({ timezone: z.string().trim().min(1).max(100) });

// Auto-detected client-side (Intl.DateTimeFormat().resolvedOptions().timeZone)
// and pinged here whenever it changes — there is no manual timezone picker.
export async function PATCH(req: NextRequest) {
  const studentId = await getCurrentStudentId();
  if (!studentId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid timezone" }, { status: 422 });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (student.timezone !== parsed.data.timezone) {
    await prisma.student.update({
      where: { id: studentId },
      data: { timezone: parsed.data.timezone },
    });
  }

  return NextResponse.json({ ok: true });
}
