"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";

export async function signOutAction() {
  // Bust cached layouts so a signed-out visitor can never see a stale
  // "Sign out"/account nav from before.
  revalidatePath("/", "layout");
  await signOut({ redirectTo: "/" });
}
