import { z } from "zod";
import { DemographicTag, IncomeBracket, SchoolYear } from "@prisma/client";

export const studentIntakeSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\-() ]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  school: z.string().trim().max(200).optional().or(z.literal("")),
  major: z.string().trim().max(200).optional().or(z.literal("")),
  year: z.nativeEnum(SchoolYear).optional().nullable(),
  gpa: z
    .coerce.number()
    .min(0, "GPA must be 0 or higher")
    .max(4.0, "GPA must be 4.0 or lower")
    .optional()
    .nullable(),
  state: z.string().trim().length(2, "Use a 2-letter state code").optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  countryOfStudy: z.string().trim().max(100).optional().or(z.literal("")),
  timezone: z.string().trim().max(100).optional().or(z.literal("")),
  incomeBracket: z.nativeEnum(IncomeBracket).optional().nullable(),
  firstGen: z.boolean().optional().nullable(),
  demographics: z.array(z.nativeEnum(DemographicTag)).default([]),
});

export type StudentIntakeInput = z.infer<typeof studentIntakeSchema>;
