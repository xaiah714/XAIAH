import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const checkoutSessionId = new URL(request.url).searchParams.get("checkout_session_id");
  if (!checkoutSessionId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId);
  const paymentIntentId =
    typeof checkoutSession.payment_intent === "string" ? checkoutSession.payment_intent : null;

  if (!paymentIntentId) return NextResponse.json({ chatSessionId: null });

  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { chatSession: true },
  });

  return NextResponse.json({ chatSessionId: payment?.chatSession?.id ?? null });
}
