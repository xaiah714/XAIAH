export const SUBJECTS = [
  { value: "MATH", label: "Math" },
  { value: "PHYSICS", label: "Physics" },
  { value: "CHEMISTRY", label: "Chemistry" },
  { value: "BIOLOGY", label: "Biology" },
  { value: "COMPUTER_SCIENCE", label: "Computer Science" },
  { value: "PSYCHOLOGY", label: "Psychology" },
  { value: "PHILOSOPHY", label: "Philosophy" },
  { value: "NURSING", label: "Nursing" },
  { value: "OTHER", label: "Other / Request a subject" },
] as const;

export type SubjectValue = (typeof SUBJECTS)[number]["value"];

export function subjectLabel(value: string): string {
  return SUBJECTS.find((s) => s.value === value)?.label ?? value;
}
