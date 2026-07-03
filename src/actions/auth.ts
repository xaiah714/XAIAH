"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn, TwoFactorRequiredError, TwoFactorInvalidError } from "@/auth";
import { AuthError } from "next-auth";
import { issueEmailVerification } from "@/lib/verification";

const GRADE_LEVEL_VALUES = ["MIDDLE_SCHOOL", "HIGH_SCHOOL", "COLLEGE", "GRAD", "OTHER"] as const;

const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["STUDENT", "TUTOR"]),
    timezone: z.string().min(1),
    gradeLevel: z.enum(GRADE_LEVEL_VALUES).optional(),
  })
  .refine((data) => data.role !== "STUDENT" || Boolean(data.gradeLevel), {
    message: "Pick a grade level",
    path: ["gradeLevel"],
  });

export type SignupState = {
  error?: string;
};

export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    timezone: formData.get("timezone"),
    gradeLevel: formData.get("gradeLevel") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password, role, timezone, gradeLevel } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      timezone,
      tutorStatus: role === "TUTOR" ? "APPLIED" : undefined,
      gradeLevel: role === "STUDENT" ? gradeLevel : undefined,
    },
  });

  await issueEmailVerification(user.id, user.email);

  try {
    await signIn("credentials", { email, password, redirectTo: "/verify-email" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Try logging in." };
    }
    throw err;
  }

  return {};
}

export type LoginState = {
  error?: string;
  requireCode?: boolean;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const code = formData.get("code");

  try {
    await signIn("credentials", {
      email,
      password,
      code: code || undefined,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    if (err instanceof TwoFactorRequiredError) {
      return { requireCode: true };
    }
    if (err instanceof TwoFactorInvalidError) {
      return { requireCode: true, error: "Invalid code — try again" };
    }
    if (err instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw err;
  }

  return {};
}
