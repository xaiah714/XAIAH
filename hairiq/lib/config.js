// ---------------------------------------------------------------------------
// HairIQ — app configuration
// ---------------------------------------------------------------------------

// Premium price + paywall copy (spec §13.1). The price/model is still an
// open decision ($1.99 one-time vs. subscription vs. free) — change it HERE
// and nowhere else. If it becomes a subscription, make the label read
// "$X/month" so the copy always matches the model.
export const PREMIUM = {
  priceLabel: "$3.99",
  unlockLabel: "Unlock for $3.99",
  // Stripe Checkout charges exactly this (unless STRIPE_PRICE_ID overrides
  // it with a dashboard-managed Price). Keep in sync with the labels above.
  amountCents: 399,
  currency: "usd",
  productName: "How Is My Hair — Premium (save your routine)",
};

// Newsletter tier topics (spec §12) — keys match the results-tab tiers.
export const NEWSLETTER_TIERS = [
  { value: "drugstore", label: "Affordable deals" },
  { value: "luxury", label: "Luxury picks" },
  { value: "crueltyFree", label: "Cruelty-free finds" },
];
