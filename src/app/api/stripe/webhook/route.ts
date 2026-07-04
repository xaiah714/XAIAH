import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { notifyTutorsForSubject } from "@/lib/notify";
import { releaseHeldPayoutsForTutor } from "@/lib/payouts";
import type { Subject } from "@/generated/prisma/client";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const kind = session.metadata?.kind;
      const userId = session.metadata?.userId;
      if (!userId) break;

      if (kind === "subscription" && typeof session.subscription === "string") {
        const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
        const periodEndRaw = (stripeSub as unknown as { current_period_end?: number })
          .current_period_end;
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeSubscriptionId: stripeSub.id,
            status: "ACTIVE",
            currentPeriodEnd: periodEndRaw ? new Date(periodEndRaw * 1000) : undefined,
          },
          update: {
            stripeSubscriptionId: stripeSub.id,
            status: "ACTIVE",
            currentPeriodEnd: periodEndRaw ? new Date(periodEndRaw * 1000) : undefined,
          },
        });
      }

      if (kind === "tip") {
        const chatSessionId = session.metadata?.chatSessionId;
        const fromId = session.metadata?.fromId;
        const toId = session.metadata?.toId;
        if (!chatSessionId || !fromId || !toId) break;

        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : undefined;

        await prisma.tip.upsert({
          where: { chatSessionId },
          create: {
            chatSessionId,
            fromId,
            toId,
            amountCents: session.amount_total ?? 0,
            platformCutCents: 0,
            stripePaymentIntentId: paymentIntentId,
          },
          update: {},
        });
      }

      if (kind === "pay_per_session") {
        const subject = session.metadata?.subject as Subject | undefined;
        if (!subject) break;

        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : undefined;

        const payment = await prisma.payment.create({
          data: {
            userId,
            type: "PAY_PER_SESSION",
            status: "SUCCEEDED",
            amountCents: session.amount_total ?? 0,
            stripePaymentIntentId: paymentIntentId,
          },
        });

        const chatSession = await prisma.chatSession.create({
          data: { studentId: userId, subject, status: "WAITING", paymentId: payment.id },
        });

        await notifyTutorsForSubject(subject, {
          type: "NEW_CHAT_REQUEST",
          chatSessionId: chatSession.id,
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!existing) break;

      const status =
        sub.status === "active"
          ? "ACTIVE"
          : sub.status === "past_due"
            ? "PAST_DUE"
            : sub.status === "canceled"
              ? "CANCELED"
              : "INCOMPLETE";

      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          status,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : undefined,
        },
      });
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionRef = invoice.parent?.subscription_details?.subscription;
      const stripeSubscriptionId =
        typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
      if (!stripeSubscriptionId) break;

      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId },
      });
      if (!subscription) break;

      const line = invoice.lines.data[0];
      const periodStart = line?.period.start ?? invoice.period_start;
      const periodEnd = line?.period.end ?? invoice.period_end;

      await prisma.subscriptionInvoice.upsert({
        where: { stripeInvoiceId: invoice.id },
        create: {
          userId: subscription.userId,
          stripeInvoiceId: invoice.id,
          amountCents: invoice.amount_paid,
          periodStart: new Date(periodStart * 1000),
          periodEnd: new Date(periodEnd * 1000),
        },
        update: {},
      });
      break;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const tutor = await prisma.user.findFirst({ where: { stripeConnectId: account.id } });
      if (!tutor) break;

      const nowReady = Boolean(account.payouts_enabled);
      await prisma.user.update({
        where: { id: tutor.id },
        data: { stripeConnectReady: nowReady },
      });

      // Just finished onboarding — pay out anything held for them right
      // away instead of making them wait for the next scheduled run.
      if (nowReady && !tutor.stripeConnectReady) {
        await releaseHeldPayoutsForTutor(tutor.id);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
