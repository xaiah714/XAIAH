// ---------------------------------------------------------------------------
// The $1.99 Blueprint — premium tab structure (rev 12).
// PERSONALIZED: buildPremiumTabs(profile) receives the user's normalized
// quiz profile and every tab can vary its content on it. The owner
// supplies the real written variations per hair type/concern/tier —
// replace the placeholder strings and add branches on `profile` freely;
// the /premium page renders whatever comes back. The "tracker" tab is
// special-cased to the interactive Tracker component.
//
// profile = {
//   hairType: "straight" | "wavy" | "curly" | "coily" | null,
//   hairTypeLabel, density, length, scalp: [..], concerns: [..],
//   concernLabels: [..], goals: [..], chemical: [..], heat, washFreq,
//   tier: "drugstore" | "luxury" | "crueltyFree", tierLabel,
//   bleached: bool, colorTreated: bool, hasQuiz: bool
// }
// ---------------------------------------------------------------------------

import { QUESTIONS } from "./questions";
import { TIER_META } from "./products";
import { buildHaircutSections } from "./haircuts";
import { retailerLinks, storeFinderLinks } from "./affiliates";
import {
  volumeSections,
  coloredSections,
  nightSections,
  swimmingSections,
  brushedSections,
  damageFreeSections,
} from "./blueprint-tabs";

const label = (qid, v) => {
  const q = QUESTIONS.find((x) => x.id === qid);
  const o = q && q.options.find((x) => x.value === v);
  return o ? o.label : v;
};
const list = (v) => (Array.isArray(v) ? v : v ? [v] : []);

export function buildProfile(answers) {
  const a = answers || {};
  const chemical = list(a.chemical);
  const concerns = list(a.concern);
  const tier = a.priority || "drugstore";
  return {
    hasQuiz: Boolean(a.hairType),
    hairType: a.hairType || null,
    hairTypeLabel: a.hairType ? label("hairType", a.hairType) : null,
    density: a.density || null,
    length: a.length || null,
    scalp: list(a.scalp),
    concerns,
    concernLabels: concerns.map((c) => label("concern", c)),
    goals: list(a.goal),
    chemical,
    heat: a.heat || null,
    washFreq: a.washFreq || null,
    tier,
    tierLabel: (TIER_META[tier] || TIER_META.drugstore).label,
    bleached: chemical.includes("bleach"),
    colorTreated: ["salonColor", "boxDye", "bleach"].some((c) => chemical.includes(c)),
  };
}

// Standard personalized lead-in every non-tracker tab gets: shows the tab
// is reading THIS user's profile, and marks exactly where the owner's
// per-combination content variations plug in.
function forYou(p, topic) {
  if (!p.hasQuiz) {
    return {
      heading: "✨ Personalize this tab",
      body: [
        "Take the quiz and this tab tailors itself to your hair type, concerns, and product tier automatically.",
      ],
    };
  }
  const bits = [
    p.hairTypeLabel && `${p.hairTypeLabel.toLowerCase()} hair`,
    p.density && `${label("density", p.density).toLowerCase()} density`,
    p.concernLabels.length && `focused on ${p.concernLabels.join(" + ").toLowerCase()}`,
    `${p.tierLabel} picks`,
  ].filter(Boolean);
  return {
    heading: "✨ For your hair",
    body: [
      `Tailored to you: ${bits.join(" · ")}.`,
      `Placeholder — the ${topic} content variation for this exact profile goes here (owner-supplied per hair type/concern/tier combination).`,
    ],
  };
}

export function buildPremiumTabs(profile) {
  const p = profile;
  return [
    {
      id: "tracker",
      title: "Care Tracker",
      emoji: "📔",
      intro: p.hasQuiz
        ? `Log wash days and everyday care${p.washFreq ? ` (you wash ${label("washFreq", p.washFreq).toLowerCase()})` : ""}, set your own goals, and track progress with timestamped photos.`
        : "Log wash days and everyday care, set your own goals, and track progress with timestamped photos.",
      interactive: true,
      sections: [],
    },
    {
      id: "where-to-buy",
      title: "Where to Buy",
      emoji: "🛒",
      intro: `Every product in your ${p.tierLabel} routine, and exactly where to grab it.`,
      sections: [
        forYou(p, "shopping-list"),
        {
          heading: "Shop the hair aisle",
          body: [
            "Every product card in your routine now has its own Buy row — one tap goes straight to that exact product at the retailer you choose. These links open the full hair-care section at each store:",
          ],
          links: retailerLinks(),
        },
        {
          heading: "Find a store near you",
          body: ["Prefer to grab it today? Store locators:"],
          links: storeFinderLinks(),
        },
      ],
    },
    {
      id: "deals",
      title: "Deals",
      emoji: "💸",
      intro: "A hand-curated feed of current hair-care deals — updated by us, no bots.",
      sections: [
        forYou(p, "deals-highlighting"),
        { heading: "This week's deals", body: ["Placeholder — the manually curated deals list (product, retailer, price, link)."] },
      ],
    },
    {
      id: "haircut",
      title: "Haircut",
      emoji: "✂️",
      intro: p.hairTypeLabel
        ? `Your cut, decided in three steps: how ${p.hairTypeLabel.toLowerCase()} hair should be cut → what your goal needs → the length that suits your face.`
        : "Your cut, decided in three steps: how your hair type should be cut → what your goal needs → the length that suits your face.",
      sections: buildHaircutSections(p),
    },
    {
      id: "volume",
      title: "Volume",
      emoji: "🎈",
      intro: p.density === "fine"
        ? "Fine density means volume takes strategy — here's what actually works, and what won't."
        : "Where volume really comes from, what kills it, and how to get it back.",
      sections: volumeSections(p),
    },
    {
      id: "colored",
      title: "Colored & Bleached",
      emoji: "🎨",
      intro: p.bleached
        ? "You told us your hair is bleached — this tab starts with your situation."
        : p.colorTreated
          ? "You told us your hair is color-treated — maintenance is where to start."
          : "Going lighter, going darker, bleach care, and keeping color alive between salon visits.",
      sections: coloredSections(p),
    },
    {
      id: "night",
      title: "At Night",
      emoji: "🌙",
      intro: "Overnight protection, hairstyles, and scalp care — matched to what's actually bothering you.",
      sections: nightSections(p),
    },
    {
      id: "swimming",
      title: "After Swimming",
      emoji: "🏊",
      intro: "Salt, chlorine and fresh water damage hair differently — here's the right prep and recovery for each.",
      sections: swimmingSections(p),
    },
    {
      id: "brushed",
      title: "Brushed",
      emoji: "🪮",
      intro: p.hairTypeLabel
        ? `How to brush ${p.hairTypeLabel.toLowerCase()} hair without breaking it.`
        : "How to brush without breaking your hair — the method almost nobody is taught.",
      sections: brushedSections(p),
    },
    {
      id: "damage-free",
      title: "Damage-Free",
      emoji: "🛡️",
      intro: "Protective styles that don't pull — and the ones quietly costing you your hairline.",
      sections: damageFreeSections(p),
    },
    {
      id: "supplements",
      title: "Supplemented",
      emoji: "💊",
      intro: "What supplements actually do for hair — and what they don't.",
      sections: [forYou(p, "supplements"), { heading: "The honest rundown", body: ["Placeholder — supplement guidance, varied by concerns (thinning/slow growth get their own track)."] }],
    },
    {
      id: "men",
      title: "For Men",
      emoji: "💈",
      intro: "A dedicated men's hair-care playbook.",
      sections: [forYou(p, "men's care"), { heading: "The routine", body: ["Placeholder — men's hair care content, varied by hair type and concerns."] }],
    },
  ];
}
