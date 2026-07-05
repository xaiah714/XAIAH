import Stripe from "stripe";

const globalForStripe = globalThis as unknown as { stripe: Stripe | undefined };

function createClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add your Stripe test-mode secret key to .env — see BUILD_PLAN.md."
    );
  }
  return new Stripe(key);
}

// Lazily instantiated so a missing key only fails when a Stripe call is
// actually made, not at build/import time (e.g. static page data collection).
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = globalForStripe.stripe ?? createClient();
    if (process.env.NODE_ENV !== "production") {
      globalForStripe.stripe = client;
    }
    return Reflect.get(client, prop, receiver);
  },
});

// Subscriptions: unlimited live chat + async answers, $5-$10/mo (see BUILD_PLAN.md for price setup).
export const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
export const SUBSCRIPTION_YEARLY_PRICE_ID = process.env.STRIPE_SUBSCRIPTION_YEARLY_PRICE_ID;
// Pay-per-session: one-off live chat access for non-subscribers, ~$2-3.
export const PAY_PER_SESSION_PRICE_ID = process.env.STRIPE_PAY_PER_SESSION_PRICE_ID;
export const PAY_PER_SESSION_FALLBACK_CENTS = 300;
