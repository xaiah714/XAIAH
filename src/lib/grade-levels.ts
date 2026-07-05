export const GRADE_LEVELS = [
  { value: "MIDDLE_SCHOOL", label: "Middle school" },
  { value: "HIGH_SCHOOL", label: "High school" },
  { value: "COLLEGE", label: "College" },
  { value: "GRAD", label: "Grad / professional" },
  { value: "OTHER", label: "Other" },
] as const;

export function gradeLevelLabel(value: string | null | undefined): string {
  if (!value) return "Not specified";
  return GRADE_LEVELS.find((g) => g.value === value)?.label ?? value;
}
