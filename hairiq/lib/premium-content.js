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
          heading: "Retailers",
          body: ["Placeholder — retailer links organized to match your routine's product list."],
          links: [
            { label: "Amazon", url: "https://www.amazon.com/s?k=hair+care" },
            { label: "Target", url: "https://www.target.com/c/hair-care" },
            { label: "Ulta", url: "https://www.ulta.com/shop/hair" },
            { label: "Walmart", url: "https://www.walmart.com/browse/beauty/hair-care" },
            { label: "CVS", url: "https://www.cvs.com/shop/beauty/hair-care" },
          ],
        },
        {
          heading: "Find a store near you",
          body: ["Placeholder — store-locator links for each retailer."],
          links: [
            { label: "Target stores", url: "https://www.target.com/store-locator/find-stores" },
            { label: "Ulta stores", url: "https://www.ulta.com/stores" },
            { label: "Walmart stores", url: "https://www.walmart.com/store-finder" },
            { label: "CVS stores", url: "https://www.cvs.com/store-locator/landing" },
          ],
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
        ? `Cut strategy for ${p.hairTypeLabel.toLowerCase()} hair — matched to your goal.`
        : "Cut strategy matched to your goal — thickness, volume, curl shape, growth, or face-framing.",
      sections: [
        forYou(p, "haircut"),
        { heading: "By goal", body: ["Placeholder — goal-based recommendations (thickness, volume, curl shape, growth, face-framing), varied by hair type."] },
        { heading: "Dusting", body: ["Placeholder — dusting as its own option: what it is, when to ask for it, how often."] },
        { heading: "⚠️ Skip the at-home split-end gadgets", body: ["Placeholder — why at-home split-end trimmers deserve caution, and what to do instead."] },
      ],
    },
    {
      id: "colored",
      title: "Colored",
      emoji: "🎨",
      intro: p.colorTreated
        ? "You told us your hair is color-treated — this tab starts with your situation."
        : "Color care by situation — going blonde, going darker, bleach, vivids, patterns, and upkeep.",
      sections: [
        forYou(p, "color-care"),
        { heading: "Blonde & lightening", body: ["Placeholder."] },
        { heading: "Going darker", body: ["Placeholder."] },
        { heading: "Vivids & patterns", body: ["Placeholder."] },
        { heading: "Maintenance & transitions", body: ["Placeholder — keeping color alive, and transition guidance between colors."] },
      ],
    },
    {
      id: "bleached",
      title: "Bleached",
      emoji: "🫧",
      intro: p.bleached
        ? "Your quiz says bleached — this whole tab is your home base."
        : "Dedicated care for bleached hair — porosity, bonds, and rebuilding.",
      sections: [forYou(p, "bleach-care"), { heading: "The bleached-hair rules", body: ["Placeholder — dedicated bleach care content."] }],
    },
    {
      id: "night",
      title: "At Night",
      emoji: "🌙",
      intro: "Overnight protection and sleep-friendly hairstyles, in depth.",
      sections: [
        forYou(p, "night-care"),
        { heading: "Protection setups", body: ["Placeholder — bonnets, pillowcases, wraps, varied by hair type and length."] },
        { heading: "Overnight hairstyles", body: ["Placeholder — braids, pineapples, heatless curls, varied by hair type."] },
      ],
    },
    {
      id: "swimming",
      title: "After Swimming",
      emoji: "🏊",
      intro: "Salt, chlorine, and plain water damage hair differently — here's the right recovery for each.",
      sections: [
        forYou(p, "swim-recovery"),
        { heading: "🌊 Saltwater / ocean", body: ["Placeholder — why salt dehydrates, pre-swim prep, and the post-swim recovery routine (varied by hair type and color treatment)."] },
        { heading: "🏊 Chlorine / pools", body: ["Placeholder — chlorine bonding to hair, chelating washes, and the post-swim recovery routine."] },
        { heading: "💧 Fresh water", body: ["Placeholder — hygral stress from long soaks and the post-swim routine."] },
        { heading: "Swim caps worth buying", body: ["Placeholder — swim cap recommendations."] },
      ],
    },
    {
      id: "brushed",
      title: "Brushed",
      emoji: "🪮",
      intro: p.hairTypeLabel
        ? `Brushing technique for ${p.hairTypeLabel.toLowerCase()} hair, tool by tool.`
        : "Brushing technique, tool by tool and texture by texture.",
      sections: [forYou(p, "brushing"), { heading: "Technique", body: ["Placeholder — brushing technique guidance, varied by texture and density."] }],
    },
    {
      id: "damage-free",
      title: "Damage-Free",
      emoji: "🛡️",
      intro: "Protective and damage-free hairstyles that still look good.",
      sections: [forYou(p, "protective-styles"), { heading: "Styles", body: ["Placeholder — protective/damage-free hairstyles, varied by hair type and length."] }],
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
