"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { stripe } from "@/lib/stripe";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const rateSchema = z.object({
  chatSessionId: z.string().min(1),
  stars: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  tipCents: z.coerce.number().int().min(0).max(50000),
});

export type RateSessionState = { error?: string };

export async function submitRatingAction(
  _prevState: RateSessionState,
  formData: FormData
): Promise<RateSessionState> {
  const user = await requireUser();

  const parsed = rateSchema.safeParse({
    chatSessionId: formData.get("chatSessionId"),
    stars: formData.get("stars"),
    comment: formData.get("comment") || undefined,
    tipCents: formData.get("tipCents") || "0",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { chatSessionId, stars, comment, tipCents } = parsed.data;

  const chatSession = await prisma.chatSession.findUnique({ where: { id: chatSessionId } });
  if (!chatSession || chatSession.studentId !== user.id || !chatSession.tutorId) {
    return { error: "This session can't be rated" };
  }

  const existing = await prisma.rating.findUnique({ where: { chatSessionId } });
  if (!existing) {
    await prisma.rating.create({
      data: { chatSessionId, fromId: user.id, toId: chatSession.tutorId, stars, comment },
    });

    const agg = await prisma.rating.aggregate({
      where: { toId: chatSession.tutorId },
      _avg: { stars: true },
      _count: { stars: true },
    });

    await prisma.user.update({
      where: { id: chatSession.tutorId },
      data: {
        ratingAverage: agg._avg.stars ?? stars,
        ratingCount: agg._count.stars,
      },
    });
  }

  if (tipCents > 0) {
    const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    let customerId = dbUser.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: dbUser.email });
      customerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: tipCents,
            product_data: { name: "Tip for your tutor" },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl()}/chat/${chatSessionId}/thank-you`,
      cancel_url: `${appUrl()}/chat/${chatSessionId}/thank-you`,
      metadata: {
        kind: "tip",
        chatSessionId,
        fromId: user.id,
        toId: chatSession.tutorId,
        amountCents: String(tipCents),
      },
    });

    if (checkoutSession.url) redirect(checkoutSession.url);
  }

  redirect(`/chat/${chatSessionId}/thank-you`);
}
