import IntakeForm from "@/components/intake-form";
import { getCurrentStudentId } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { StudentIntakeInput } from "@/lib/validation";

export default async function ProfilePage() {
  const studentId = await getCurrentStudentId();
  const student = studentId
    ? await prisma.student.findUnique({ where: { id: studentId } })
    : null;

  const defaultValues: Partial<StudentIntakeInput> | undefined = student
    ? {
        email: student.email,
        phone: student.phone ?? "",
        school: student.school ?? "",
        major: student.major ?? "",
        year: student.year,
        gpa: student.gpa,
        state: student.state ?? "",
        country: student.country ?? "",
        countryOfStudy: student.countryOfStudy ?? "",
        incomeBracket: student.incomeBracket,
        firstGen: student.firstGen,
        demographics: student.demographics,
      }
    : undefined;

  return (
    <main>
      <IntakeForm defaultValues={defaultValues} />
    </main>
  );
}
