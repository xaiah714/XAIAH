import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { studentIntakeSchema } from "@/lib/validation";
import { getCurrentStudentId, setCurrentStudentId } from "@/lib/session";
import { syncMatchesForStudent } from "@/lib/matching";

function emptyToUndefined<T extends string | undefined>(v: T) {
  return v === "" ? undefined : v;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = studentIntakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;

  const student = await prisma.student.upsert({
    where: { email: data.email },
    create: {
      email: data.email,
      phone: emptyToUndefined(data.phone),
      school: emptyToUndefined(data.school),
      major: emptyToUndefined(data.major),
      year: data.year ?? undefined,
      gpa: data.gpa ?? undefined,
      state: emptyToUndefined(data.state)?.toUpperCase(),
      country: emptyToUndefined(data.country),
      countryOfStudy: emptyToUndefined(data.countryOfStudy),
      timezone: emptyToUndefined(data.timezone),
      incomeBracket: data.incomeBracket ?? undefined,
      firstGen: data.firstGen ?? undefined,
      demographics: data.demographics,
    },
    update: {
      phone: emptyToUndefined(data.phone),
      school: emptyToUndefined(data.school),
      major: emptyToUndefined(data.major),
      year: data.year ?? undefined,
      gpa: data.gpa ?? undefined,
      state: emptyToUndefined(data.state)?.toUpperCase(),
      country: emptyToUndefined(data.country),
      countryOfStudy: emptyToUndefined(data.countryOfStudy),
      // Keep whichever timezone we already have if this update omits it
      // (e.g. a background timezone-sync ping vs. a full profile save).
      timezone: emptyToUndefined(data.timezone) ?? undefined,
      incomeBracket: data.incomeBracket ?? undefined,
      firstGen: data.firstGen ?? undefined,
      demographics: data.demographics,
    },
  });

  await setCurrentStudentId(student.id);
  await syncMatchesForStudent(student.id);

  return NextResponse.json({ student });
}

export async function GET() {
  const studentId = await getCurrentStudentId();
  if (!studentId) {
    return NextResponse.json({ student: null });
  }
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  return NextResponse.json({ student });
}
