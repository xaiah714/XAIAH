/**
 * Recommendation engine + all routine content.
 *
 * Structure:
 *  - PRINCIPLES: the cross-cutting hair-care principles (spec §6) as reusable
 *    copy blocks, referenced by id from any routine step or note.
 *  - CONCERNS: per-concern routines and product picks (spec §7). The answer
 *    to Q4 (main concern) is the primary lookup key.
 *  - buildRoutine(): merges the concern content with the rest of the quiz
 *    answers into a fully personalized result. All three product tiers are
 *    always calculated; Q10 only picks which tab shows first.
 *
 * Everything user-facing lives in this file so copy can be edited without
 * touching components.
 */

import type { Answers } from "./quiz";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type TierId = "drugstore" | "luxury" | "vegan";

export type ConcernId =
  | "thinning"
  | "dryness"
  | "frizz"
  | "breakage"
  | "dandruff"
  | "growth"
  | "curlyBeginner";

export type PrincipleId =
  | "prePoo"
  | "sweatRule"
  | "scalpMassage"
  | "nightProtection"
  | "k18"
  | "uvProtection"
  | "boxDyeCaution"
  | "locMethod";

export type BadgeId = "vegan" | "new" | "staple" | "dupe";

export interface Tier {
  id: TierId;
  label: string;
  short: string;
}

export interface Product {
  name: string;
  /** What this product is for, in the user's routine. */
  role: string;
  badges?: BadgeId[];
  note?: string;
}

export interface Step {
  title: string;
  detail: string;
  /** Deep-link to a principle block for the full "why & how". */
  principleId?: PrincipleId;
}

export interface Principle {
  id: PrincipleId;
  emoji: string;
  title: string;
  summary: string;
  paragraphs: string[];
  /** Ordered how-to steps (rendered as a numbered list). */
  steps?: string[];
  /** Mutually-fine choices to call out clearly (e.g. K18's two finishes). */
  options?: { title: string; body: string }[];
}

export interface ExtraNote {
  title: string;
  body: string[];
}

export interface ConcernContent {
  id: ConcernId;
  label: string;
  resultTitle: string;
  washDay: Step[];
  daily: Step[];
  nightly: Step[];
  products: Record<TierId, Product[]>;
  /** Principles this routine leans on (shown in "The why behind it"). */
  principleIds: PrincipleId[];
  /** The 1–2 steps to keep when someone only has 5 minutes. */
  coreSteps: string;
  extraNote?: ExtraNote;
}

export interface PersonalNote {
  id: string;
  emoji: string;
  title: string;
  body: string;
  tone: "info" | "warning";
  principleId?: PrincipleId;
}

export interface RoutineResult {
  concern: ConcernContent;
  defaultTier: TierId;
  notes: PersonalNote[];
  principles: Principle[];
  chips: string[];
}

/* ------------------------------------------------------------------ */
/* Tiers                                                               */
/* ------------------------------------------------------------------ */

export const TIERS: Tier[] = [
  { id: "drugstore", label: "Drugstore", short: "Budget-friendly" },
  { id: "luxury", label: "Luxury", short: "Premium picks" },
  { id: "vegan", label: "Vegan & Cruelty-Free", short: "Certified kind" },
];

export const BADGES: Record<BadgeId, { label: string; className: string }> = {
  vegan: { label: "Vegan", className: "bg-mint text-cocoa" },
  new: { label: "New", className: "bg-butter text-cocoa" },
  staple: { label: "Staple pick", className: "bg-butter text-cocoa" },
  dupe: { label: "Budget dupe", className: "bg-mint text-cocoa" },
};

/* ------------------------------------------------------------------ */
/* Principles (spec §6) — reusable copy blocks                          */
/* ------------------------------------------------------------------ */

export const PRINCIPLES: Record<PrincipleId, Principle> = {
  prePoo: {
    id: "prePoo",
    emoji: "🥥",
    title: "Pre-wash oil treatment (\"pre-poo\")",
    summary:
      "Oil your mid-lengths and ends 10–20+ minutes before shampooing — every hair type benefits.",
    paragraphs: [
      "Applying oil before you shampoo reduces friction and breakage during washing. Everyone can benefit — if your hair is fine or low-porosity, just use a lighter hand so it doesn't get weighed down.",
      "Why coconut oil specifically? Its fatty-acid structure lets it actually penetrate the hair shaft rather than just sitting on the surface — the main reason it's the most-recommended pre-poo oil in the hair-science world. Oils like argan work more on the surface (great for shine and smoothness) but don't penetrate the same way.",
      "Buy a hair-specific coconut oil product, not the cooking jar. Hair-formulated versions are processed to be lighter and spread more easily, so they don't leave the waxy buildup that solid, unrefined cooking-grade coconut oil can.",
    ],
    options: [
      {
        title: "OGX Coconut Miracle Oil Penetrating Oil (original)",
        body: "The more intense treatment — great for thick, dry, or high-porosity hair.",
      },
      {
        title: "OGX Coconut Miracle Oil weightless spray",
        body: "The lighter mist version — good for finer hair or first-timers.",
      },
      {
        title: "Argan oil",
        body: "A lighter, surface-level alternative if you find coconut oil too heavy.",
      },
    ],
  },

  sweatRule: {
    id: "sweatRule",
    emoji: "💦",
    title: "Scalp-aware washing & the sweat rule",
    summary:
      "Wash whenever works for you — but if you sweat today, wash tonight. Dry shampoo doesn't count.",
    paragraphs: [
      "There's no fixed \"correct\" wash schedule — wash whenever works for your hair and your life.",
      "One firm rule though: if you sweat that day (workout, hot day, whatever), wash your hair after — don't just let it air dry. Sweat, sebum, and salt sitting on the scalp for hours can lead to buildup, odor, and irritation.",
      "Dry shampoo is fine between washes, but it is not a substitute for washing after sweating — it only absorbs surface oil. It doesn't actually remove sweat, salt, or bacteria from the scalp.",
      "Double-washing: if your scalp feels heavy with product, sweat, or buildup, shampoo twice. The first wash breaks down surface buildup; the second actually cleanses the scalp — and it's when a medicated or treatment shampoo does its real work.",
    ],
  },

  scalpMassage: {
    id: "scalpMassage",
    emoji: "👐",
    title: "Scalp massage, done right",
    summary: "10 minutes a day with fingertips (never nails) — plus a cheap scalp brush if you want a boost.",
    paragraphs: [
      "Fingertip massage — never nails — is the default technique: about 10 minutes daily, working in small circles across the whole scalp.",
      "A wood or bamboo-style scalp massage brush is a great optional add-on (they're widely available in multi-packs for around $10 on Amazon). It helps distribute product, gently exfoliates buildup, and the added stimulation may support scalp circulation.",
    ],
  },

  nightProtection: {
    id: "nightProtection",
    emoji: "🌙",
    title: "Nighttime hair protection",
    summary:
      "Friction while you sleep causes breakage, dryness, and frizz — a small night step pays off for every hair type.",
    paragraphs: [
      "Friction and movement while sleeping cause mechanical breakage, dryness, and frizz over time — worth a dedicated night step, especially for long hair.",
      "Luxury pick: Kérastase Nutritive 8H Magic Night Serum, followed by a lightweight hair oil. Drugstore dupe: L'Oréal Paris Elvive Extraordinary Oil Midnight Serum — commonly cited as a similar, much cheaper alternative.",
      "Protective styling for sleep: a loose braid plus a silk or satin bonnet (or pillowcase) works for straight and wavy hair; a loose, high \"pineapple\" pony protects the curl pattern overnight for curly and coily hair. It works for any hair type — just adjust the styling step to your texture.",
    ],
  },

  k18: {
    id: "k18",
    emoji: "🧬",
    title: "Bond treatment: K18, used correctly",
    summary:
      "K18 Leave-In Molecular Repair Mask is the staple bond-repair pick — but most people use it wrong and waste product.",
    paragraphs: [
      "K18 Leave-In Molecular Repair Hair Mask is our staple bond-treatment pick. A lot of people use it incorrectly and waste product — here's the right way:",
    ],
    steps: [
      "Shampoo — and skip your regular rinse-out conditioner this wash (it can block the treatment from working).",
      "Towel-dry until damp, not dripping.",
      "Rub 1–3 pumps between your palms first so it distributes evenly before touching your hair — this avoids over-applying and wasting product.",
      "Apply from mid-lengths to ends, working upward. Avoid the scalp.",
      "Leave it for 4 minutes.",
    ],
    options: [
      {
        title: "Option A — Leave it in",
        body: "Go straight to your leave-in conditioner and styling products. This is K18's official \"leave-in treatment\" use.",
      },
      {
        title: "Option B — Rinse + condition",
        body: "Rinse the K18 out, then apply your regular conditioner, wait however long that conditioner calls for, and rinse it out too. A lot of people find this gives noticeably softer hair and gets more out of the K18 than skipping conditioner entirely — which is what most people accidentally do, thinking they can't use conditioner at all after K18. The \"no conditioner\" rule in step 1 is only about before the treatment, not after.",
      },
    ],
  },

  uvProtection: {
    id: "uvProtection",
    emoji: "☀️",
    title: "Sun & UV protection",
    summary: "UV can visibly change your ends over a single summer — especially on color-treated hair.",
    paragraphs: [
      "UV exposure can visibly change the color and texture of your ends over a summer, especially on color-treated hair.",
      "A leave-in UV protection spray is the easy fix — for example Pantene Sunkiss Glow, which targets UV, salt, and chlorine exposure specifically.",
    ],
  },

  boxDyeCaution: {
    id: "boxDyeCaution",
    emoji: "📦",
    title: "Box dye + future bleach: proceed carefully",
    summary:
      "At-home box dye can build up metallic salts that react unpredictably with future bleach or bond-repair services.",
    paragraphs: [
      "At-home box dye contains metallic salts that can build up in hair and react unpredictably with future bleach or bond-repair services — sometimes causing gumminess or breakage.",
      "Before any future bleach or salon color: use a clarifying/chelating shampoo, and make sure to mention your box-dye history to your stylist.",
    ],
  },

  locMethod: {
    id: "locMethod",
    emoji: "💧",
    title: "The LOC / LCO method",
    summary:
      "Layer Liquid, Oil, and Cream to lock in moisture — the order depends on your hair's porosity.",
    paragraphs: [
      "For locking in moisture (especially for curly, coily, or dry hair), layer three things:",
    ],
    steps: [
      "L — Liquid: water or a water-based leave-in, to actually hydrate the hair.",
      "O — Oil: a lightweight oil applied next, to seal that moisture in.",
      "C — Cream: a heavier cream or butter on top, to lock everything in and add definition.",
    ],
    options: [
      {
        title: "LOC order (oil before cream)",
        body: "Tends to work better for low-porosity hair — the cuticle lies flatter, so a lighter oil layer first prevents product from just sitting on top.",
      },
      {
        title: "LCO order (cream before oil)",
        body: "Tends to work better for high-porosity hair — the cuticle is more open and rough, so it needs the heavier cream sealed in by an oil layer on top to actually hold.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Concern routines (spec §7)                                          */
/* ------------------------------------------------------------------ */

export const CONCERNS: Record<ConcernId, ConcernContent> = {
  thinning: {
    id: "thinning",
    label: "Thinning or density loss",
    resultTitle: "Your density-boosting routine",
    washDay: [
      {
        title: "Pre-poo oil treatment",
        detail:
          "Oil your mid-lengths and ends 10–20 minutes before shampooing to cut friction and breakage in the wash.",
        principleId: "prePoo",
      },
      {
        title: "Growth-supporting shampoo",
        detail: "Use a growth-supporting shampoo on wash days (see your product picks below).",
      },
    ],
    daily: [
      {
        title: "10-minute scalp massage",
        detail: "Fingertips, never nails — or use a scalp massage brush. Daily consistency is the whole game.",
        principleId: "scalpMassage",
      },
      {
        title: "Skip tight hairstyles",
        detail: "Avoid styles that pull on the hairline — constant tension is a common, sneaky cause of thinning edges.",
      },
    ],
    nightly: [
      {
        title: "Scalp serum, 3–4 nights a week",
        detail: "Apply a growth serum directly to the scalp before bed (see your product picks below).",
      },
      {
        title: "Protect your hair while you sleep",
        detail: "Loose braid or pineapple plus silk/satin — details in the night-protection guide.",
        principleId: "nightProtection",
      },
    ],
    products: {
      drugstore: [
        {
          name: "Mielle Rosemary Mint Scalp & Strengthening Oil",
          role: "Scalp oil for massage & overnight treatment",
        },
        {
          name: "OGX Thick & Full Biotin & Collagen Shampoo",
          role: "Growth-supporting wash-day shampoo",
        },
      ],
      luxury: [
        {
          name: "Act+Acre Cold Processed Scalp Detox",
          role: "Scalp reset & buildup removal",
        },
      ],
      vegan: [
        { name: "Vegamour GRO Hair Serum", role: "Nightly scalp growth serum", badges: ["vegan"] },
        { name: "Briogeo Scalp Revival Scrub", role: "Weekly scalp exfoliation", badges: ["vegan"] },
      ],
    },
    principleIds: ["scalpMassage", "prePoo", "nightProtection", "sweatRule"],
    coreSteps: "the daily 10-minute scalp massage and the nightly scalp serum",
    extraNote: {
      title: "If you're doing everything right and still seeing thinning…",
      body: [
        "…the cause may not be your routine at all. A few things worth checking: getting 7+ hours of sleep, staying hydrated, and managing stress all genuinely affect hair.",
        "And if shedding is sudden, patchy, or persistent, it's worth asking a doctor about bloodwork — iron/ferritin, vitamin D, B12, zinc, and thyroid are the usual suspects. This isn't a diagnosis — just worth checking with a doctor so you're not troubleshooting the wrong thing.",
      ],
    },
  },

  dryness: {
    id: "dryness",
    label: "Dryness or damage",
    resultTitle: "Your moisture-repair routine",
    washDay: [
      {
        title: "Pre-poo oil treatment",
        detail:
          "Coconut oil on mid-lengths and ends 10–20 minutes before shampooing — dry hair benefits from this the most.",
        principleId: "prePoo",
      },
      {
        title: "Deep-conditioning mask, once a week",
        detail:
          "Leave it on 15–20 minutes under a shower cap or warm towel — the heat helps it absorb properly.",
      },
      {
        title: "Leave-in conditioner every wash day",
        detail: "Apply to damp hair after washing to hold moisture in between washes.",
      },
    ],
    daily: [
      {
        title: "Handle it gently",
        detail: "Minimize heat, skip rough towel-drying, and keep hands off between styles.",
      },
      {
        title: "Trim every 8–10 weeks",
        detail: "Damaged ends can't be repaired forever — regular trims keep damage from traveling up the strand.",
      },
    ],
    nightly: [
      {
        title: "Night serum or oil on the ends",
        detail: "A nighttime serum locks in moisture while you sleep — see the night-protection guide for picks.",
        principleId: "nightProtection",
      },
      {
        title: "Silk or satin, always",
        detail: "Bonnet or pillowcase — cotton wicks moisture out of dry hair overnight.",
        principleId: "nightProtection",
      },
    ],
    products: {
      drugstore: [
        { name: "OGX Coconut Miracle Oil Mask", role: "Weekly deep-conditioning mask" },
        { name: "Aussie 3 Minute Miracle", role: "Quick deep conditioner for busy weeks" },
      ],
      luxury: [{ name: "Olaplex No.3 Hair Perfector", role: "Weekly at-home repair treatment" }],
      vegan: [
        {
          name: "Briogeo Don't Despair, Repair! Mask",
          role: "Weekly deep-conditioning mask",
          badges: ["vegan"],
        },
        {
          name: "Innersense Hydrating Cream Conditioner",
          role: "Every-wash conditioner",
          badges: ["vegan"],
        },
      ],
    },
    principleIds: ["prePoo", "nightProtection", "locMethod", "sweatRule"],
    coreSteps: "the weekly deep-conditioning mask and a leave-in on every wash day",
  },

  frizz: {
    id: "frizz",
    label: "Frizz",
    resultTitle: "Your frizz-taming routine",
    washDay: [
      {
        title: "Layer moisture with LOC/LCO",
        detail:
          "Liquid, then oil, then cream (or cream before oil for high-porosity hair) — frizz is mostly hair searching for moisture.",
        principleId: "locMethod",
      },
      {
        title: "Dry with microfiber or a t-shirt",
        detail: "Rough terry towels rough up the cuticle and undo everything — blot and scrunch instead of rubbing.",
      },
    ],
    daily: [
      {
        title: "Hands off once it's dry",
        detail: "Touching dry hair breaks up the cast and invites frizz — style it damp, then leave it alone.",
      },
    ],
    nightly: [
      {
        title: "Protect the style overnight",
        detail: "Loose braid or pineapple plus silk/satin keeps friction (and morning frizz) down.",
        principleId: "nightProtection",
      },
    ],
    products: {
      drugstore: [
        { name: "OGX Anti-Frizz Argan Oil Serum", role: "Smoothing serum for damp or dry hair" },
        { name: "Not Your Mother's Frizz Go Away", role: "Frizz-control styler" },
      ],
      luxury: [
        { name: "Living Proof No Frizz Leave-In Conditioner", role: "Leave-in frizz blocker" },
      ],
      vegan: [
        { name: "Rahua Frizz-Free Cream", role: "Smoothing styling cream", badges: ["vegan"] },
        { name: "Bread Beauty Supply Hair Oil", role: "Lightweight sealing oil", badges: ["vegan"] },
      ],
    },
    principleIds: ["locMethod", "nightProtection", "prePoo", "sweatRule"],
    coreSteps: "LOC/LCO layering on wash day and switching to a microfiber towel",
  },

  breakage: {
    id: "breakage",
    label: "Breakage & split ends",
    resultTitle: "Your bond-repair routine",
    washDay: [
      {
        title: "Bond-repair treatment",
        detail:
          "K18 on wash days, used correctly — the how-to matters more than the product here, so read the guide.",
        principleId: "k18",
      },
      {
        title: "Detangle wet, wide-tooth only",
        detail:
          "Only detangle wet hair, with a wide-tooth comb, starting from the ends and working up. Never rip through dry hair.",
      },
    ],
    daily: [
      {
        title: "Low manipulation",
        detail: "The less pulling, brushing, and re-styling, the faster breakage stops. Loose styles are your friend.",
      },
      {
        title: "Trim every 8–10 weeks",
        detail: "Split ends travel upward if you let them — regular dusting keeps the damage from compounding.",
      },
    ],
    nightly: [
      {
        title: "Silk or satin every night",
        detail: "A silk/satin pillowcase or bonnet removes the nightly friction that causes mechanical breakage.",
        principleId: "nightProtection",
      },
    ],
    products: {
      drugstore: [
        { name: "OGX Bond Repair Shampoo & Conditioner", role: "Wash-day bond-repair system" },
        { name: "L'Oréal EverPure Bond Strengthening line", role: "Alternative bond-repair system" },
      ],
      luxury: [
        {
          name: "K18 Leave-In Molecular Repair Mask",
          role: "The staple bond treatment",
          badges: ["staple"],
        },
      ],
      vegan: [
        {
          name: "Olaplex No.4 Shampoo + No.5 Conditioner",
          role: "Bond-maintenance wash system",
          badges: ["vegan"],
          note: "Certified vegan & cruelty-free — it reads \"luxury-ish\" but it genuinely belongs on this tab.",
        },
      ],
    },
    principleIds: ["k18", "nightProtection", "prePoo", "sweatRule"],
    coreSteps: "the K18 treatment on wash days and a silk/satin pillowcase every night",
  },

  dandruff: {
    id: "dandruff",
    label: "Dandruff or flaking",
    resultTitle: "Your scalp-reset routine",
    washDay: [
      {
        title: "Medicated shampoo, twice a week",
        detail:
          "Alternate it with a gentle everyday shampoo. Use the double-wash technique: first wash clears buildup, second is when the medicated shampoo actually treats the scalp.",
        principleId: "sweatRule",
      },
      {
        title: "Keep hot water off your scalp",
        detail: "Hot water aggravates a flaky scalp — wash with warm, rinse with cool.",
      },
      {
        title: "Scalp exfoliation, once a week",
        detail: "A scalp brush or scrub once a week lifts flakes and buildup gently.",
        principleId: "scalpMassage",
      },
    ],
    daily: [
      {
        title: "Resist scratching",
        detail: "Nails make irritation (and flaking) worse — if it itches, massage with fingertips instead.",
      },
    ],
    nightly: [
      {
        title: "Standard night protection",
        detail: "Loose style plus silk/satin — and wash your pillowcase often while treating a flaky scalp.",
        principleId: "nightProtection",
      },
    ],
    products: {
      drugstore: [
        { name: "Nizoral Anti-Dandruff Shampoo", role: "Medicated treatment shampoo (2x/week)" },
        {
          name: "Head & Shoulders",
          role: "Second-wash treatment shampoo",
          note: "Works well as one wash within a double-wash routine — it doesn't have to replace your whole shampoo/conditioner system, just swap it in for the second wash.",
        },
      ],
      luxury: [
        { name: "Christophe Robin Purifying Scalp Scrub", role: "Weekly purifying scalp scrub" },
      ],
      vegan: [
        {
          name: "Briogeo Scalp Revival Charcoal + Coconut Oil Scrub",
          role: "Weekly scalp exfoliating scrub",
          badges: ["vegan"],
        },
      ],
    },
    principleIds: ["sweatRule", "scalpMassage", "nightProtection"],
    coreSteps: "the medicated shampoo (as the second wash of a double wash) twice a week",
  },

  growth: {
    id: "growth",
    label: "Slow growth",
    resultTitle: "Your growth-support routine",
    washDay: [
      {
        title: "Pre-poo before shampooing",
        detail: "Less breakage in the wash means more retained length — growth you keep is growth you see.",
        principleId: "prePoo",
      },
      {
        title: "Monthly protein treatment",
        detail: "Once a month, swap your usual mask for a protein treatment to keep strands strong as they grow.",
      },
    ],
    daily: [
      {
        title: "Regular trims (yes, really)",
        detail:
          "Trims don't make hair grow faster — they stop split ends from breaking off the length you've already grown.",
      },
    ],
    nightly: [
      {
        title: "10-minute scalp massage with oil",
        detail: "Nightly, with a growth oil — fingertips or a scalp brush, never nails.",
        principleId: "scalpMassage",
      },
      {
        title: "Growth serum on the scalp",
        detail: "Apply directly to the scalp, then protect your hair for sleep.",
        principleId: "nightProtection",
      },
    ],
    products: {
      drugstore: [
        { name: "Mielle Rosemary Mint Scalp & Strengthening Oil", role: "Nightly massage oil" },
        { name: "Maple Holistics Biotin Growth Serum", role: "Scalp growth serum" },
      ],
      luxury: [
        { name: "Act+Acre scalp treatments", role: "Scalp-health treatment system" },
      ],
      vegan: [
        { name: "Vegamour GRO Serum", role: "Scalp growth serum", badges: ["vegan"] },
      ],
    },
    principleIds: ["scalpMassage", "prePoo", "nightProtection", "sweatRule"],
    coreSteps: "the nightly scalp massage with oil",
  },

  curlyBeginner: {
    id: "curlyBeginner",
    label: "New to curly/wavy — styling basics",
    resultTitle: "Your curl-starter routine",
    washDay: [
      {
        title: "Sulfate-free shampoo or co-wash",
        detail: "Harsh sulfates strip the moisture curls depend on — start gentle.",
      },
      {
        title: "Detangle with conditioner still in",
        detail:
          "Fingers or a wide-tooth comb only, while your hair is slippery with conditioner. Never brush dry hair.",
      },
      {
        title: "LOC/LCO on soaking-wet hair",
        detail: "Layer your products while hair is dripping wet — that's what locks the curl pattern in.",
        principleId: "locMethod",
      },
      {
        title: "Scrunch, then plop",
        detail:
          "Scrunch upward, then wrap hair in a microfiber towel or old t-shirt (\"plopping\") for 10–15 minutes.",
      },
      {
        title: "Diffuse low, or air-dry",
        detail: "If you use a dryer, use a diffuser on low heat. Otherwise just let it be.",
      },
    ],
    daily: [
      {
        title: "Refresh on days 2–3",
        detail: "A spritz of water plus a small amount of leave-in wakes curls back up — no need to re-wash.",
      },
      {
        title: "Never brush dry hair",
        detail: "Brushing dry curls turns them to frizz — save all detangling for wash day, with conditioner in.",
      },
    ],
    nightly: [
      {
        title: "Pineapple it",
        detail: "A loose, high pony on top of your head protects the curl pattern overnight — add a silk/satin bonnet or pillowcase.",
        principleId: "nightProtection",
      },
    ],
    products: {
      drugstore: [
        { name: "Cantu Coconut Curling Cream", role: "Defining curl cream" },
        { name: "Aussie Miracle Curls Air Dry Cream", role: "Low-effort air-dry styler" },
      ],
      luxury: [
        { name: "DevaCurl One Condition Original", role: "Rich daily conditioner" },
        { name: "Ouidad Climate Control Gel", role: "Humidity-proof styling gel" },
      ],
      vegan: [
        { name: "Innersense Curl Crème", role: "Defining curl cream", badges: ["vegan"] },
        { name: "Bread Beauty Supply Curl Whip", role: "Lightweight curl styler", badges: ["vegan"] },
      ],
    },
    principleIds: ["locMethod", "nightProtection", "prePoo", "sweatRule"],
    coreSteps: "LOC/LCO on soaking-wet hair and the day-2 refresh spritz",
  },
};

/* ------------------------------------------------------------------ */
/* Personalization                                                     */
/* ------------------------------------------------------------------ */

function asArray(v: string | string[] | undefined): string[] {
  return Array.isArray(v) ? v : [];
}

function asString(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

const HAIR_TYPE_LABELS: Record<string, string> = {
  straight: "Straight",
  wavy: "Wavy",
  curly: "Curly",
  coily: "Coily",
};

const TIME_LABELS: Record<string, string> = {
  five: "5-min routine",
  fifteen: "10–15 min routine",
  twentyPlus: "20+ min routine",
};

/**
 * The engine. Takes the full answer set and returns the personalized result.
 * All three product tiers are always present in the returned concern content —
 * the priority answer only chooses the default tab.
 */
export function buildRoutine(answers: Answers): RoutineResult {
  const concernId = (asString(answers.concern) || "dryness") as ConcernId;
  const concern = CONCERNS[concernId] ?? CONCERNS.dryness;

  const hairType = asString(answers.hairType);
  const density = asString(answers.density);
  const scalp = asString(answers.scalp);
  const chemical = asArray(answers.chemical);
  const heat = asString(answers.heat);
  const washFreq = asString(answers.washFreq);
  const time = asString(answers.time);

  const priority = asString(answers.priority);
  const defaultTier: TierId =
    priority === "luxury" ? "luxury" : priority === "vegan" ? "vegan" : "drugstore";

  const notes: PersonalNote[] = [];

  // Night styling, matched to texture (§6.4).
  const curlyTexture = hairType === "curly" || hairType === "coily";
  notes.push({
    id: "nightStyle",
    emoji: "🌙",
    title: "Your sleep style",
    body: curlyTexture
      ? "For your curl pattern: a loose, high \"pineapple\" pony overnight, ideally with a silk or satin bonnet or pillowcase."
      : "For your texture: a loose braid plus a silk or satin bonnet or pillowcase keeps friction (and morning frizz) down.",
    tone: "info",
    principleId: "nightProtection",
  });

  // Pre-poo weight, matched to density (§6.1).
  if (density === "fine" || density === "notSure") {
    notes.push({
      id: "prePooWeight",
      emoji: "🪶",
      title: "Go light on the pre-poo",
      body:
        density === "fine"
          ? "Fine hair gets weighed down easily — start with the OGX Coconut Miracle weightless spray version, and use a light hand."
          : "Since you're new to this, start with the OGX Coconut Miracle weightless spray — it's the beginner-friendly weight. You can move up to the original once you know how your hair responds.",
      tone: "info",
      principleId: "prePoo",
    });
  }

  // Heat styling (Q7).
  if (heat === "daily" || heat === "weekly") {
    notes.push({
      id: "heatProtect",
      emoji: "🔥",
      title: "Heat protectant, every single pass",
      body:
        heat === "daily"
          ? "You heat style daily, so this is non-negotiable: a heat protectant spray before every session, and keep tools at the lowest temperature that works. Your future ends will thank you."
          : "A few times a week still adds up — use a heat protectant spray before every session and keep tools at the lowest temperature that gets the job done.",
      tone: "info",
    });
  }

  // Wash frequency (Q8) + the sweat rule (§6.2).
  notes.push({
    id: "washRhythm",
    emoji: "💦",
    title: "Your wash rhythm",
    body:
      (washFreq === "daily"
        ? "Daily washing is totally fine — just keep the shampoo gentle so you're not stripping your scalp. "
        : washFreq === "weekly"
          ? "Weekly-or-less works great for many hair types — consider a double wash on wash day so the scalp actually gets clean. "
          : "Your schedule is fine exactly as it is — there's no \"correct\" frequency. ") +
      "One firm rule regardless: if you sweat today, wash tonight. Dry shampoo doesn't count after a sweat.",
    tone: "info",
    principleId: "sweatRule",
  });

  // Scalp type (Q3).
  if (scalp === "dry") {
    notes.push({
      id: "scalpDry",
      emoji: "🏜️",
      title: "For your dry scalp",
      body: "Keep hot water off your scalp (warm wash, cool rinse), and let your scalp oil or serum do double duty as a scalp moisturizer.",
      tone: "info",
    });
  } else if (scalp === "oily") {
    notes.push({
      id: "scalpOily",
      emoji: "💧",
      title: "For your oily scalp",
      body: "The double-wash technique is your best friend: the first shampoo breaks down oil and buildup, the second actually cleanses. Focus conditioner on mid-lengths and ends only.",
      tone: "info",
      principleId: "sweatRule",
    });
  } else if (scalp === "sensitive") {
    notes.push({
      id: "scalpSensitive",
      emoji: "🌡️",
      title: "For your sensitive scalp",
      body: "Introduce one new product at a time so you can spot what irritates. And if irritation is painful, spreading, or not improving with gentle care, that's a dermatologist visit — not a product problem.",
      tone: "warning",
    });
  }

  // Chemical history (Q6).
  if (chemical.includes("boxDye")) {
    notes.push({
      id: "boxDye",
      emoji: "📦",
      title: "Heads-up: box dye history",
      body: "Box dye can leave metallic salts in your hair that react unpredictably with future bleach or bond-repair services (sometimes causing gumminess or breakage). Use a clarifying/chelating shampoo before any future bleach or salon color — and tell your stylist about the box dye.",
      tone: "warning",
      principleId: "boxDyeCaution",
    });
  }
  if (chemical.includes("bleach")) {
    notes.push({
      id: "bleach",
      emoji: "⚪",
      title: "Bleached hair loves bond repair",
      body: "Bleach breaks bonds by design, so a regular bond treatment (K18 is our staple pick — see the guide for correct use) earns a permanent spot in your wash-day routine.",
      tone: "info",
      principleId: "k18",
    });
  }
  if (chemical.includes("keratin")) {
    notes.push({
      id: "keratin",
      emoji: "💆",
      title: "Protect your keratin treatment",
      body: "Stick to sulfate-free shampoos — harsh sulfates dissolve smoothing treatments faster and shorten how long yours lasts.",
      tone: "info",
    });
  }
  if (chemical.includes("relaxer")) {
    notes.push({
      id: "relaxer",
      emoji: "🧪",
      title: "Relaxed or permed hair note",
      body: "Chemically processed hair is more porous and thirstier than it looks — be extra consistent with deep conditioning, and the LCO order (cream before oil) is usually the better fit.",
      tone: "info",
      principleId: "locMethod",
    });
  }
  if (chemical.includes("salonColor") || chemical.includes("bleach") || chemical.includes("boxDye")) {
    notes.push({
      id: "colorUv",
      emoji: "☀️",
      title: "Color-treated + summer sun",
      body: "UV can visibly shift color-treated ends over a single summer. A leave-in UV spray — like Pantene Sunkiss Glow, which also targets salt and chlorine — protects your color on sunny days.",
      tone: "info",
      principleId: "uvProtection",
    });
  } else {
    notes.push({
      id: "uv",
      emoji: "☀️",
      title: "Summer sun note",
      body: "UV exposure can change the texture and tone of your ends over a summer. On beach, pool, or long-sun days, a leave-in UV protection spray (e.g. Pantene Sunkiss Glow) is a cheap insurance policy.",
      tone: "info",
      principleId: "uvProtection",
    });
  }

  // Time budget (Q9).
  if (time === "five") {
    notes.push({
      id: "shortOnTime",
      emoji: "⚡",
      title: "Your 5-minute version",
      body: `Busy is fine — if you only do two things from this routine, make it ${concern.coreSteps}. Everything else is bonus.`,
      tone: "info",
    });
  }

  // Principles for this result: the concern's own list, plus any pulled in by notes.
  const principleIds = new Set<PrincipleId>(concern.principleIds);
  for (const n of notes) if (n.principleId) principleIds.add(n.principleId);
  const principles = Array.from(principleIds).map((id) => PRINCIPLES[id]);

  const chips = [
    HAIR_TYPE_LABELS[hairType] ?? "",
    concern.label,
    TIME_LABELS[time] ?? "",
  ].filter(Boolean);

  return { concern, defaultTier, notes, principles, chips };
}
