"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import {
  stripe,
  SUBSCRIPTION_PRICE_ID,
  PAY_PER_SESSION_PRICE_ID,
  PAY_PER_SESSION_FALLBACK_CENTS,
} from "@/lib/stripe";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function ensureStripeCustomer(userId: string, email: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({ email, metadata: { userId } });
  await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customer.id } });
  return customer.id;
}

export async function createSubscriptionCheckoutAction() {
  const user = await requireUser();
  const customerId = await ensureStripeCustomer(user.id, user.email ?? "");

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: SUBSCRIPTION_PRICE_ID
      ? [{ price: SUBSCRIPTION_PRICE_ID, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "usd",
              unit_amount: 700,
              recurring: { interval: "month" },
              product_data: { name: "TutorApp unlimited membership" },
            },
            quantity: 1,
          },
        ],
    success_url: `${appUrl()}/account/subscription?success=1`,
    cancel_url: `${appUrl()}/account/subscription?canceled=1`,
    metadata: { userId: user.id, kind: "subscription" },
  });

  if (!checkoutSession.url) throw new Error("Stripe did not return a checkout URL");
  redirect(checkoutSession.url);
}

const paySchema = z.object({ subject: z.string().min(1) });

export async function createPayPerSessionCheckoutAction(
  _prevState: { error?: string },
  formData: FormData
) {
  const user = await requireUser();
  const parsed = paySchema.safeParse({ subject: formData.get("subject") });
  if (!parsed.success) return { error: "Missing subject" };

  const customerId = await ensureStripeCustomer(user.id, user.email ?? "");

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: PAY_PER_SESSION_PRICE_ID
      ? [{ price: PAY_PER_SESSION_PRICE_ID, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "usd",
              unit_amount: PAY_PER_SESSION_FALLBACK_CENTS,
              product_data: { name: "TutorApp one-time live chat session" },
            },
            quantity: 1,
          },
        ],
    success_url: `${appUrl()}/chat/pending?checkout_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/chat/new`,
    metadata: { userId: user.id, kind: "pay_per_session", subject: parsed.data.subject },
  });

  if (!checkoutSession.url) return { error: "Stripe did not return a checkout URL" };
  redirect(checkoutSession.url);
}

export async function createBillingPortalSessionAction() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!dbUser.stripeCustomerId) redirect("/account/subscription");

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${appUrl()}/account/subscription`,
  });

  redirect(portalSession.url);
}
