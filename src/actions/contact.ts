"use server";

import { z } from "zod";
import { sendContactEmail } from "@/lib/email";

const contactSchema = z.object({
  email: z.string().email("Enter a valid email so we can reply"),
  message: z.string().min(10, "Tell us a bit more").max(4000),
});

export type ContactFormState = { error?: string; success?: boolean };

export async function contactAction(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await sendContactEmail(parsed.data.email, parsed.data.message);
  return { success: true };
}
