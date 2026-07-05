"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { stripe } from "@/lib/stripe";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createConnectOnboardingLinkAction() {
  const user = await requireRole("TUTOR");
  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

  let accountId = dbUser.stripeConnectId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: dbUser.email,
      capabilities: { transfers: { requested: true } },
    });
    accountId = account.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeConnectId: accountId } });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl()}/account/payouts`,
    return_url: `${appUrl()}/account/payouts?onboarded=1`,
    type: "account_onboarding",
  });

  redirect(accountLink.url);
}
