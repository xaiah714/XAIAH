import { redirect } from "next/navigation";
import IntakeForm from "@/components/intake-form";
import { getCurrentStudentId } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { StudentIntakeInput } from "@/lib/validation";
import AuthHeader from "@/components/auth-header";

export default async function ProfilePage() {
  const studentId = await getCurrentStudentId();
  if (!studentId) redirect("/login");

  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student) redirect("/login");

  const defaultValues: Partial<StudentIntakeInput> = {
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
  };

  return (
    <main>
      <AuthHeader />
      <IntakeForm defaultValues={defaultValues} email={student.email} />
    </main>
  );
}
