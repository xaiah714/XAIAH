// ---------------------------------------------------------------------------
// HairIQ — Recommendation engine (spec sections 7, 8, 9 + section 6 logic)
//
// buildRoutine(answers) is the single entry point. It returns the full
// routine with ALL THREE tiers (drugstore / luxury / crueltyFree)
// pre-calculated per step, so the results page can switch tabs instantly.
//
// Layering model:
//   1. Concern (Q4) drives the concern-specific steps       → section 7
//   2. Time available (Q9) gates the framework extras       → sections 8 + 9
//   3. Cross-cutting principles adjust copy and picks       → section 6
// ---------------------------------------------------------------------------

import { QUESTIONS } from "./questions.js";
import { productPool, TIER_KEYS } from "./products.js";

export const DEPTHS = { five: 1, fifteen: 2, twentyPlus: 3 };

export const DEPTH_LABELS = {
  1: "Core routine · 5 min or less",
  2: "Standard routine · 10–15 min",
  3: "Full routine · 20+ min",
};

// Q4 lookup — the primary driver of results (spec section 7).
export const CONCERNS = {
  thinning: {
    label: "Thinning or density loss",
    headline: "Your plan for fuller-feeling hair",
    blurb: "Scalp-first: daily massage, night serums, and growth-supporting washes — with zero tension on the hairline.",
  },
  dryness: {
    label: "Dryness or damage",
    headline: "Your plan for softer, healthier hair",
    blurb: "Moisture in, moisture kept: pre-wash oil, a weekly deep mask, and a leave-in every single wash day.",
  },
  frizz: {
    label: "Frizz",
    headline: "Your plan for smooth, calm hair",
    blurb: "Frizz is thirst plus friction — so we hydrate in layers (LOC/LCO), dry gently, and then keep hands off.",
  },
  breakage: {
    label: "Breakage & split ends",
    headline: "Your plan for stronger hair",
    blurb: "Bond repair on wash days, silk at night, and gentle detangling — strength is built in the details.",
  },
  dandruff: {
    label: "Dandruff or flaking",
    headline: "Your plan for a calm, flake-free scalp",
    blurb: "Medicated washes done the right way (as the second wash), weekly exfoliation, and no hot water on the scalp.",
  },
  slowGrowth: {
    label: "Slow growth",
    headline: "Your plan for length that sticks around",
    blurb: "Nightly scalp massage, growth serum, and monthly protein — plus trims so breakage stops erasing your progress.",
  },
  curlyNew: {
    label: "New to curly or wavy hair",
    headline: "Your starter curl routine",
    blurb: "The beginner-proof version: sulfate-free washing, styling on soaking-wet hair, plopping, and day-2 refreshes.",
  },
};

const WASH_INTROS = {
  daily: "You wash daily — keep the everyday wash gentle, and save the heavier treatments for one or two designated “full” wash days a week.",
  everyOther: "You wash every other day — wash days come around often, so rotate the extras across them instead of doing everything every time.",
  twiceWeek: "You wash about twice a week — treat each wash day as a mini reset and give the treatment steps room to work.",
  weekly: "You wash weekly (or less) — make that one wash day count, and lean on the Daily tab to keep your scalp happy in between.",
};

function optionLabel(questionId, value) {
  const q = QUESTIONS.find((question) => question.id === questionId);
  const opt = q && q.options.find((o) => o.value === value);
  return opt ? opt.label : value;
}

// Pick up to `limit` products for one tier: preferred ids first (spec section 7
// highlighted defaults), then library order (spec section 8).
function pickProducts(tierKey, categories, prefer = [], limit = 3) {
  if (!categories || categories.length === 0) return [];
  const pool = productPool(tierKey).filter((p) =>
    p.categories.some((cat) => categories.includes(cat))
  );
  const preferred = prefer
    .map((id) => pool.find((p) => p.id === id))
    .filter(Boolean);
  const rest = pool.filter((p) => !prefer.includes(p.id));
  return [...preferred, ...rest].slice(0, limit);
}

function makeStep(def) {
  const products = {};
  for (const tierKey of TIER_KEYS) {
    products[tierKey] =
      def.noProducts || def.variants
        ? []
        : pickProducts(tierKey, def.categories || [], (def.prefer && def.prefer[tierKey]) || [], def.limit || 3);
  }
  // Variants: mutually exclusive options within ONE step (e.g. bond-repair
  // timing) — rendered as "pick one", never as a checklist.
  const variants = def.variants
    ? def.variants.map((variant) => {
        const variantProducts = {};
        for (const tierKey of TIER_KEYS) {
          variantProducts[tierKey] = pickProducts(
            tierKey,
            variant.categories || [],
            (variant.prefer && variant.prefer[tierKey]) || [],
            variant.limit || 2
          );
        }
        return {
          id: variant.id,
          label: variant.label,
          tag: variant.tag || null,
          note: variant.note || null,
          emptyText: variant.emptyText || null,
          products: variantProducts,
        };
      })
    : null;
  return {
    id: def.id,
    phase: def.phase,
    title: def.title,
    how: def.how,
    frequency: def.frequency || null,
    principleId: def.principleId || null,
    optional: !!def.optional,
    emptyText: def.emptyText || null,
    noProducts: !!def.noProducts,
    products,
    variants,
  };
}

export function buildRoutine(answers) {
  const depth = DEPTHS[answers.time] || 2;
  const concern = CONCERNS[answers.concern] || CONCERNS.dryness;
  const c = answers.concern;
  const chem = Array.isArray(answers.chemical) ? answers.chemical : [];
  // Scalp + goals are multi-select (rev 7) — normalize so old single-string
  // answers from saved sessions keep working. Old "dry" was "Dry & flaky".
  const scalpList = Array.isArray(answers.scalp)
    ? answers.scalp
    : answers.scalp
      ? [answers.scalp]
      : [];
  const scalpOily = scalpList.includes("oily");
  const scalpDry = scalpList.includes("dry");
  const scalpFlaky = scalpList.includes("flaky");
  const scalpSensitive = scalpList.includes("sensitive");
  const goalList = Array.isArray(answers.goal)
    ? answers.goal
    : answers.goal
      ? [answers.goal]
      : [];
  const goalHas = (g) => goalList.includes(g);
  const fine = answers.density === "fine" || answers.density === "unsure";
  const thick = answers.density === "thick";
  const shortHair = answers.length === "short";
  const curlyTexture = answers.hairType === "curly" || answers.hairType === "coily";
  const colorTreated = chem.includes("salonColor") || chem.includes("boxDye") || chem.includes("bleach");
  const highPorosity = chem.includes("bleach") || chem.includes("relaxer");
  const locOrder = highPorosity ? "LCO" : "LOC";
  const locText = highPorosity
    ? "LCO order (leave-in → cream → oil) — bleached or chemically treated hair is usually higher porosity, so the oil goes on top to hold everything in"
    : "LOC order (leave-in → oil → cream) — a light oil layer first works best unless your hair is very porous";

  const steps = [];

  // ------------------------------------------------------------- WASH DAY --
  // Pre-poo (6.1 / 8.1) — core for thinning & dryness, full-depth for others.
  // Gated by hair length (spec §11.1): the step exists to protect lengths of
  // ends from friction, so short hair skips it entirely — recommending it
  // anyway is exactly the irrelevant-recommendation problem the spec calls out.
  if (!shortHair && (depth >= 3 || c === "thinning" || c === "dryness")) {
    steps.push({
      id: "pre-poo",
      phase: "washDay",
      title: "Pre-wash oil treatment (“pre-poo”)",
      frequency: "10–20 min before shampoo",
      how:
        (fine
          ? "A light coat of oil on mid-lengths and ends before you shampoo — use a light hand (or the weightless mist) so fine hair doesn't get weighed down."
          : "Coat mid-lengths and ends with oil 10–20+ minutes before you shampoo — it cushions hair against friction and breakage during the wash.") +
        (c === "breakage"
          ? " For breakage specifically, this is the whole point: the oil cushions strands against wash-time friction — the exact mechanical stress that snaps fragile hair."
          : ""),
      categories: ["pre-poo"],
      principleId: "prePoo",
      prefer: {
        drugstore: fine
          ? ["ogx-coconut-weightless-oil", "ogx-coconut-penetrating-oil"]
          : ["ogx-coconut-penetrating-oil", "ogx-coconut-weightless-oil"],
        crueltyFree: ["playa-ritual-oil"],
        luxury: [],
      },
      emptyText:
        "No luxury-tier pre-poo in the library yet — the OGX coconut oils (Drugstore tab) are the science-backed pick here regardless of budget.",
    });
  }

  // Bond repair (8.1 / 8.3 / 8.5) — ONE treatment with a choice of timing,
  // never a checklist of three (spec §8 "which bond treatment do I actually
  // need?" callout). At Full depth all three timings render inside a single
  // "pick one" step; at Standard depth only the in-shower option shows, so
  // there's nothing to confuse. Handled below, after the shampoo steps.

  // Shampoo (8.2) — always present; flavor depends on concern + scalp.
  if (c === "dandruff") {
    steps.push({
      id: "shampoo",
      phase: "washDay",
      title: "Shampoo — gentle daily, medicated 2×/week",
      frequency: "Every wash",
      how:
        "Alternate a gentle shampoo with a medicated one about twice a week. When your scalp feels heavy, double-wash: gentle first to break down buildup, medicated second so it can actually treat the scalp. Keep the water warm — never hot — on an irritated scalp.",
      categories: ["medicated-shampoo"],
      principleId: "doubleWash",
      prefer: {
        drugstore:
          scalpDry || scalpSensitive
            ? ["cerave-anti-dandruff", "nizoral", "head-shoulders-classic"]
            : ["nizoral", "head-shoulders-classic"],
        luxury: ["oribe-serene-scalp"],
        crueltyFree: ["derma-e-scalp-relief", "jason-dandruff-relief"],
      },
    });
  } else if (c === "thinning") {
    steps.push({
      id: "shampoo",
      phase: "washDay",
      title: "Shampoo — growth support",
      frequency: "Every wash",
      how: "A growth-supporting wash on wash days. Massage it into the scalp with fingertips — that's where it earns its keep.",
      categories: ["growth-shampoo", "strengthening-shampoo"],
      principleId: "scalpWash",
      prefer: {
        drugstore: ["ogx-thick-full-shampoo"],
        luxury: [],
        crueltyFree: ["aveda-range"],
      },
    });
  } else if (c === "curlyNew") {
    steps.push({
      id: "shampoo",
      phase: "washDay",
      title: "Wash — sulfate-free shampoo or co-wash",
      frequency: "Every wash",
      how: "Curls dry out fast, so keep the wash gentle: a sulfate-free shampoo (or a co-wash if your scalp isn't oily), focused on the scalp.",
      categories: ["sulfate-free"],
      principleId: "scalpWash",
      prefer: {
        drugstore: ["loreal-everpure-bond-shampoo"],
        luxury: ["pureology-strength-cure-shampoo"],
        crueltyFree: ["curlsmith-range"],
      },
      limit: 2,
    });
  } else if (c === "breakage") {
    steps.push({
      id: "shampoo",
      phase: "washDay",
      title: "Shampoo — bond strengthening",
      frequency: "Every wash",
      how: "A bond-strengthening wash, and be gentle: lather at the scalp, squeeze (don't scrub) the lengths.",
      categories: ["strengthening-shampoo"],
      principleId: "scalpWash",
      prefer: {
        drugstore: ["ogx-bond-shampoo", "loreal-everpure-bond-shampoo"],
        luxury: chem.includes("bleach") ? ["pureology-blonde-shampoo", "amika-kure-shampoo"] : ["amika-kure-shampoo"],
        crueltyFree: ["olaplex-no4"],
      },
    });
  } else if (c === "slowGrowth") {
    steps.push({
      id: "shampoo",
      phase: "washDay",
      title: "Shampoo — growth support",
      frequency: "Every wash",
      how: "A growth-supporting wash on wash days, massaged into the scalp with fingertips.",
      categories: ["growth-shampoo", "strengthening-shampoo"],
      principleId: "scalpWash",
      prefer: {
        drugstore: ["ogx-thick-full-shampoo"],
        luxury: ["dr-groot-thickening"],
        crueltyFree: ["aveda-range"],
      },
    });
  } else {
    steps.push({
      id: "shampoo",
      phase: "washDay",
      title: "Shampoo",
      frequency: "Every wash",
      how: scalpOily
        ? "Focus shampoo on the scalp, not the lengths — and when it feels heavy with product or sweat, double-wash."
        : scalpDry
          ? "Massage into the scalp and let the runoff clean the lengths — no need to scrub dry ends."
          : "A strengthening wash, massaged into the scalp with fingertips.",
      categories: ["strengthening-shampoo"],
      principleId: "scalpWash",
      prefer: {
        drugstore: [],
        luxury: chem.includes("bleach") ? ["pureology-blonde-shampoo"] : [],
        crueltyFree: [],
      },
    });
  }

  // Clarifying rotation (8.2) — standard depth+; dandruff's medicated routine
  // already handles scalp reset.
  if (depth >= 2 && c !== "dandruff") {
    steps.push({
      id: "clarify",
      phase: "washDay",
      title: "Clarifying wash (swap in)",
      frequency: "1×/week",
      how:
        (chem.includes("boxDye")
          ? "Once a week, swap in a clarifying shampoo to reset buildup. With box dye in your history, make it a chelating formula (like Metal Detox) — see the note below about your next color appointment."
          : "Once a week, swap your regular shampoo for a clarifying one — it resets product and hard-water buildup so everything else works better.") +
        " If you double-wash that day, clarify only once: follow it with a hydrating, non-clarifying shampoo for the second wash.",
      categories: ["clarifying-shampoo"],
      principleId: "doubleWash",
      prefer: {
        drugstore: chem.includes("boxDye")
          ? ["loreal-metal-detox", "pantene-volume-body"]
          : ["pantene-volume-body"],
        luxury: [],
        crueltyFree: [],
      },
    });
  }

  // Bond repair (8.1 / 8.3 / 8.5) — one step, pick one timing.
  const bondPrefer = {
    drugstore: ["k18-mask", "loreal-everpure-bond-concentrate", "nym-tough-love-treatment"],
    luxury: ["k18-mask"],
    crueltyFree: ["k18-mask", "olaplex-no3"],
  };
  if (depth >= 3) {
    steps.push({
      id: "bond-repair",
      phase: "washDay",
      title: c === "breakage" ? "Bond-repair treatment — pick ONE timing" : "Bond treatment — pick ONE timing",
      optional: c !== "breakage",
      frequency: "Weekly · K18 every few weeks",
      how: "Bond repair is one step with three possible timings — not three separate steps, so don't stack all of them. In-shower is the standard starting point; before- or after-shower are alternatives if a mid-shower step doesn't fit. Our top pick is K18 in every tab — yes, even Affordable: it's the one luxury splurge that's earned it (science-backed, never duped). Full instructions below.",
      principleId: "k18",
      variants: [
        {
          id: "bond-in-shower",
          label: "In shower",
          tag: "Start here",
          note: "Right after shampoo, before conditioner — the standard starting point.",
          categories: ["bond-treatment"],
          prefer: bondPrefer,
          limit: 2,
        },
        {
          id: "bond-pre-shower",
          label: "Before shower",
          tag: "Alternative",
          note: "Apply at least 10 minutes before washing — same job, earlier timing (Olaplex No.3 is literally designed this way).",
          categories: ["pre-wash-bond"],
          prefer: {
            drugstore: ["ogx-bond-preshampoo"],
            luxury: ["olaplex-no3"],
            crueltyFree: ["olaplex-no3"],
          },
          limit: 2,
        },
        {
          id: "bond-post-shower",
          label: "After shower",
          tag: "Alternative",
          note: "On damp hair, then wait 10 minutes before any other product.",
          categories: ["post-bond"],
          limit: 2,
          emptyText: "No pick in this tab for this timing — go with the in-shower option.",
        },
      ],
    });
  } else if (depth >= 2 || c === "breakage") {
    steps.push({
      id: "bond-treatment",
      phase: "washDay",
      title: c === "breakage" ? "Bond-repair treatment" : "Bond treatment",
      optional: c !== "breakage",
      frequency: "Weekly · K18 every few weeks",
      how: "One bond builder, weekly or as needed — in the shower, right after shampoo and before conditioner. Our top pick is K18 in every tab, even Affordable: it's the one luxury splurge that's earned it (science-backed, never duped). It's pricey but a bottle lasts months — full instructions below.",
      categories: ["bond-treatment"],
      principleId: "k18",
      prefer: bondPrefer,
    });
  }

  // Conditioner (8.4) — always present.
  steps.push({
    id: "condition",
    phase: "washDay",
    title: "Condition",
    frequency: "Every wash",
    how:
      c === "breakage"
        ? "Never skip this — unconditioned hair tangles, and tangles are how fragile hair snaps. Mid-lengths to ends, never the scalp. On K18 washes, conditioner comes back in after the treatment window — see the K18 steps — not before."
        : c === "curlyNew"
          ? "Condition generously every wash — curls genuinely need more than straight hair (that's correct dosing, not overuse). Mid-lengths to ends, never the scalp. This is also your detangling window (next step)."
          : scalpOily
            ? "Split into two sections and work it from mid-lengths to ends only — keep it off the roots. Every single wash, no skipping."
            : "Split into two sections and work it from mid-lengths to ends — never the scalp. Every single wash; a generous amount is normal.",
    principleId: "conditionerWhy",
    categories: ["conditioner"],
    prefer: {
      drugstore:
        c === "breakage" ? ["ogx-bond-conditioner", "loreal-everpure-bond-conditioner"] : [],
      luxury:
        c === "curlyNew"
          ? ["devacurl-one-condition"]
          : chem.includes("bleach")
            ? ["pureology-blonde-conditioner"]
            : c === "dryness"
              ? ["pureology-strength-cure-conditioner"]
              : [],
      crueltyFree:
        c === "curlyNew"
          ? ["devacurl-one-condition", "innersense-hydrating-conditioner"]
          : c === "breakage"
            ? ["olaplex-no5"]
            : c === "dryness"
              ? ["innersense-hydrating-conditioner"]
              : [],
    },
  });

  // Detangle rule — its own micro-step for curly beginners (spec section 7).
  if (c === "curlyNew") {
    steps.push({
      id: "detangle",
      phase: "washDay",
      title: "Detangle while the conditioner is in",
      frequency: "Every wash",
      how: "Fingers or a wide-tooth comb, working from the ends up — never brush curls once they're dry. Rinse when you're through it.",
      categories: ["tool-detangle"],
      limit: 1,
    });
  }

  // Deep treatment (8.4 mask / concern-specific).
  if (c === "dryness") {
    steps.push({
      id: "mask",
      phase: "washDay",
      title: "Deep conditioning mask",
      frequency: "1×/week",
      how: "15–20 minutes with a shower cap or warm towel over it — the warmth helps it actually absorb instead of sitting on top.",
      categories: ["mask"],
      prefer: {
        drugstore: ["ogx-coconut-miracle-mask", "aussie-3-minute"],
        luxury: ["olaplex-no3"],
        crueltyFree: ["briogeo-dont-despair"],
      },
    });
  } else if (c === "slowGrowth") {
    steps.push({
      id: "protein",
      phase: "washDay",
      title: "Protein treatment",
      frequency: "1×/month",
      how: "A monthly protein treatment keeps strands strong enough to hold onto their length — growth you don't break off is growth you keep.",
      categories: ["protein-treatment"],
      prefer: {
        drugstore: ["cer100-protein", "k18-mask"],
        luxury: ["k18-mask"],
        crueltyFree: ["k18-mask"],
      },
    });
  } else if (depth >= 3) {
    steps.push({
      id: "gloss-mask",
      phase: "washDay",
      title: "Gloss or mask add-on",
      optional: true,
      frequency: "As needed",
      how: "Pick 1–2 conditioning layers per wash — gloss + conditioner, gloss + mask, or conditioner + mask all combine fine.",
      categories: ["gloss", "mask"],
      prefer: { drugstore: [], luxury: [], crueltyFree: [] },
    });
  }

  // Post-shower bond repair (8.5) renders as the "After shower" timing inside
  // the bond-repair step above — never as its own extra step (spec §8 callout).

  // Leave-in (8.6) — gated by actual heat use (spec §11.3): heat users get the
  // protectant-forward picks; rarely/never gets everyday moisturizing leave-ins
  // with zero "protectant" framing.
  const usesHeat = answers.heat === "daily" || answers.heat === "weekly";
  steps.push({
    id: "leave-in",
    phase: "washDay",
    title: usesHeat ? "Leave-in conditioner + heat protectant" : "Everyday leave-in conditioner",
    frequency: "Every wash day",
    how:
      c === "curlyNew" || c === "frizz"
        ? `Apply liberally to soaking-wet hair — this is the L (liquid) of your ${locOrder} layers.`
        : answers.heat === "daily"
          ? "Apply liberally to damp hair, every wash day — and never let a hot tool touch bare hair."
          : usesHeat
            ? "Apply liberally to damp hair, every wash day. This is the step that makes everything else look better."
            : "Since hot tools aren't your thing, skip the heat-protectant sprays entirely — a moisturizing everyday leave-in on damp hair is all this step needs.",
    categories: ["leave-in"],
    prefer: usesHeat
      ? {
          drugstore: [],
          luxury: colorTreated ? ["pureology-color-fanatic"] : [],
          crueltyFree: [],
        }
      : {
          drugstore: colorTreated
            ? ["loreal-purple-10in1", "loreal-no-haircut-cream", "loreal-everpure-2in1"]
            : ["loreal-no-haircut-cream", "loreal-everpure-2in1", "pantene-miracle-rescue-spray"],
          luxury: ["crown-affair-leave-in", "redken-one-united"],
          crueltyFree: ["crown-affair-leave-in", "nym-tough-love-leave-in"],
        },
  });

  // Styling (8.7 / concern-specific).
  if (c === "curlyNew") {
    steps.push({
      id: "style-curls",
      phase: "washDay",
      title: `Style soaking wet — ${locOrder} layers`,
      frequency: "Every wash day",
      how: `While hair is still soaking wet, layer in ${locText}. Scrunch upward to encourage the pattern.`,
      categories: ["curl-styler"],
      principleId: "loc",
      prefer: {
        drugstore: ["cantu-curling-cream", "aussie-miracle-curls"],
        luxury: ["devacurl-one-condition", "ouidad-climate-control"],
        crueltyFree: ["innersense-curl-creme", "bread-curl-whip", "devacurl-one-condition"],
      },
    });
    steps.push({
      id: "plop",
      phase: "washDay",
      title: "Plop, then air-dry or diffuse",
      frequency: "Every wash day",
      how: "Wrap curls up in a microfiber towel or old t-shirt for 10–15 minutes (“plopping”), then air-dry or diffuse on low heat. No rough terry towels, no touching while it dries.",
      categories: ["tool-dry"],
      limit: 1,
    });
  } else if (c === "frizz") {
    steps.push({
      id: "loc-seal",
      phase: "washDay",
      title: `Lock in moisture — ${locOrder} layers`,
      frequency: "Every wash day",
      how: `Frizz is hair searching the air for moisture — beat it to the punch. On damp hair, layer in ${locText}.`,
      categories: ["anti-frizz"],
      principleId: "loc",
      prefer: {
        drugstore: ["ogx-antifrizz-argan-serum", "nym-frizz-go-away"],
        luxury: ["livingproof-no-frizz"],
        crueltyFree: ["rahua-frizz-free-cream", "bread-hair-oil"],
      },
    });
    steps.push({
      id: "dry-gently",
      phase: "washDay",
      title: "Dry gently",
      frequency: "Every wash day",
      how: "Blot and scrunch with a microfiber towel or a t-shirt — rough terry towels rough up the cuticle and undo everything you just did.",
      categories: ["tool-dry"],
      limit: 1,
    });
  } else if (depth >= 2 && (c === "thinning" || fine)) {
    steps.push({
      id: "style-volume",
      phase: "washDay",
      title: "Volume styling",
      optional: true,
      frequency: "As you like",
      how: "Lift at the roots: mousse on damp roots before drying, or a texture spray once dry. Style away from tension on the hairline.",
      categories: ["styling"],
      prefer: {
        drugstore: ["tresemme-volume-mousse", "tresemme-dry-texture"],
        luxury: ["k18-astrolift", "livingproof-dry-volume"],
        crueltyFree: ["k18-astrolift", "oribe-dry-texturizing"],
      },
    });
  } else if (depth >= 2 && (curlyTexture || answers.hairType === "wavy")) {
    steps.push({
      id: "style-texture",
      phase: "washDay",
      title: "Define your texture",
      optional: true,
      frequency: "As you like",
      how: `A curl cream or styler on damp hair, scrunched up and left alone to dry${curlyTexture ? ` — ${locOrder} layering applies here too` : ""}.`,
      categories: ["curl-styler"],
      principleId: curlyTexture ? "loc" : null,
      prefer: {
        drugstore: ["cantu-curling-cream", "aussie-miracle-curls"],
        luxury: ["ouidad-climate-control"],
        crueltyFree: ["innersense-curl-creme", "bread-curl-whip"],
      },
    });
  } else if (depth >= 3) {
    steps.push({
      id: "style",
      phase: "washDay",
      title: "Styling",
      optional: true,
      frequency: "As you like",
      how: "Whatever your look calls for — texture, volume, or shape. Any order, personal preference.",
      categories: ["styling"],
      prefer: { drugstore: [], luxury: [], crueltyFree: [] },
    });
  }

  // Style sealers (8.8) — full depth; frizz & curly routines already seal.
  if (depth >= 3 && c !== "frizz" && c !== "curlyNew") {
    steps.push({
      id: "sealer",
      phase: "washDay",
      title: "Seal it in",
      optional: true,
      frequency: "After styling",
      how: fine
        ? "A few drops of serum or lightweight oil on the ends only — fine hair wants finish, not weight."
        : thick || curlyTexture
          ? `A cream or oil over everything locks the style in — ${locOrder} order applies here too.`
          : "A serum, cream, or oil over your leave-in for extra smoothness and shine.",
      categories: fine
        ? ["sealer-serum", "sealer-oil"]
        : thick || curlyTexture
          ? ["sealer-cream", "sealer-oil"]
          : ["sealer-serum", "sealer-cream", "sealer-oil"],
      prefer: { drugstore: [], luxury: [], crueltyFree: [] },
    });
  }

  // ------------------------------------------------------------- EVERY DAY --
  // Scalp massage (6.3) — daily for thinning; also for the scalp-health goal.
  if (c === "thinning" || (goalHas("scalpHealth") && c !== "slowGrowth" && c !== "dandruff")) {
    steps.push({
      id: "scalp-massage",
      phase: "daily",
      title: "Scalp massage",
      frequency: "10 min daily",
      how: "Fingertips, never nails — small circles across the whole scalp. A cheap scalp brush makes the habit easier to keep.",
      categories: ["tool-scalp"],
      principleId: "scalpMassage",
      limit: 1,
    });
  }

  // Weekly scalp exfoliation for dandruff (spec section 7).
  if (c === "dandruff") {
    steps.push({
      id: "scalp-exfoliate",
      phase: "daily",
      title: "Scalp exfoliation",
      frequency: "1×/week",
      how: "Once a week, a scalp scrub (or a scalp brush used in the shower) lifts flakes and buildup so the medicated washes can reach skin.",
      categories: ["scalp-scrub", "tool-scalp"],
      principleId: "scalpMassage",
      prefer: {
        drugstore: ["scalp-massage-brush"],
        luxury: ["christophe-robin-scrub"],
        crueltyFree: ["briogeo-scalp-revival"],
      },
    });
  }

  // Curl refresh (spec section 7 — curly starter routine).
  if (c === "curlyNew") {
    steps.push({
      id: "refresh",
      phase: "daily",
      title: "Refresh, don't re-wash",
      frequency: "Day 2–3",
      how: "Mist curls with water plus a small amount of your leave-in, scrunch, and go. No new products needed — it's the same leave-in from wash day.",
      noProducts: true,
    });
  }

  // UV protection (6.6) — seasonal; reframed per v1 feedback as an everyday
  // summer swap, not a "before going outside" extra step.
  steps.push({
    id: "uv-shield",
    phase: "daily",
    title: "Make your leave-in a UV one for summer",
    frequency: "All summer",
    how: colorTreated
      ? "Sun can visibly shift color-treated hair over one summer. No extra step needed — just let a UV leave-in replace your regular leave-in until fall, worn every day."
      : "A summer of sun can change the color and texture of your ends. No extra step needed — just let a UV leave-in replace your regular leave-in until fall.",
    categories: ["uv-protect"],
    principleId: "uvProtection",
    prefer: {
      drugstore: ["pantene-sunkiss-glow"],
      luxury: ["jvn-uv", "bb-invisible-oil-primer"],
      crueltyFree: ["jvn-uv", "sunbum-heat-protector"],
    },
    limit: 2,
  });

  // The right brush (spec §11.2 + §6.13) — lookup on hair type AND density,
  // with wet-vs-dry guidance corrected per type: curls wet-only, wavy either
  // way, straight usually dry. Universal rule: detangle ends-first, upward.
  if (answers.hairType === "straight" && thick) {
    steps.push({
      id: "brush",
      phase: "daily",
      title: "Brush with a boar + nylon blend",
      frequency: "Daily-ish",
      how: "Thick straight hair wants a boar + nylon blend: the boar distributes your scalp's natural oils for shine, and the nylon pins actually get through the density. Brush dry (wet hair is fragile for everyone — wide-tooth comb, gently, if you must), starting at the ends and working up.",
      categories: ["tool-brush-blend"],
      principleId: "brushing",
      prefer: { drugstore: [], luxury: ["crown-affair-brush"], crueltyFree: [] },
      limit: 2,
    });
  } else if (answers.hairType === "straight") {
    steps.push({
      id: "brush",
      phase: "daily",
      title: "Brush with pure boar bristle",
      frequency: "Daily-ish",
      how: "For fine-to-normal straight hair, a pure boar bristle brush earns its spot: it carries your scalp's natural oils down the length for shine. Brush dry (wet hair is fragile for everyone — wide-tooth comb, gently, if you must), starting at the ends and working up.",
      categories: ["tool-brush-boar"],
      principleId: "brushing",
      prefer: { drugstore: [], luxury: ["mason-pearson"], crueltyFree: [] },
      limit: 2,
    });
  } else if (answers.hairType === "wavy") {
    steps.push({
      id: "brush",
      phase: "daily",
      title: "Brush wavy hair its way",
      frequency: "Your call",
      how: "Waves get both options: detangle wet with a wet brush and conditioner in (the gentle default), or brush dry if you actually want softer, less-defined waves — dry brushing breaks up wave clumps on purpose. Either way, start at the ends and work upward.",
      categories: ["tool-brush-wet"],
      principleId: "brushing",
      prefer: { drugstore: [], luxury: [], crueltyFree: [] },
      limit: 1,
    });
  } else {
    steps.push({
      id: "brush",
      phase: "daily",
      title: "Use the right brush (a wet one)",
      frequency: "Wash day only",
      how: "Curls and coils get a wet detangling brush at any density — flexible bristles that work through knots without snapping strands. Use it on wet hair with conditioner in, always from the ends up, and never brush this texture dry.",
      categories: ["tool-brush-wet"],
      principleId: "brushing",
      prefer: { drugstore: [], luxury: [], crueltyFree: [] },
      limit: 1,
    });
  }

  // Between-wash heat protection (8.9) — driven by the heat question.
  if (answers.heat === "daily" || (answers.heat === "weekly" && depth >= 2)) {
    steps.push({
      id: "heat-protect",
      phase: "daily",
      title: "Heat protectant before every hot tool",
      frequency: answers.heat === "daily" ? "Daily" : "Before hot tools",
      how:
        answers.heat === "daily"
          ? "Every pass of a hot tool on bare hair is cumulative damage — this is the one product never to skip. Try to sneak in a couple of heat-free days a week, too."
          : "Any day a hot tool comes out between washes, a heat protectant goes on first.",
      categories: ["heat-protect"],
      prefer: {
        drugstore: ["tresemme-heat-spray"],
        luxury: ["livingproof-phd-heat"],
        crueltyFree: ["sunbum-heat-protector"],
      },
    });
  }

  // Dry shampoo (8.9) — standard depth+; curly routine refreshes with water instead.
  if (depth >= 2 && c !== "curlyNew") {
    steps.push({
      id: "dry-shampoo",
      phase: "daily",
      title: "Dry shampoo between washes",
      frequency: "As needed",
      how: "Great for greasy roots between washes — but it only absorbs surface oil. If you sweat today, actually wash tonight (see the sweat rule below).",
      categories: ["dry-shampoo"],
      principleId: "sweatRule",
    });
  }

  // Between-wash conditioning oil (8.9) — full depth.
  if (depth >= 3) {
    steps.push({
      id: "between-oil",
      phase: "daily",
      title: "Mid-week moisture",
      optional: true,
      frequency: "Dry or tangly days",
      how: "When hair feels dry or tangly between washes, smooth a little oil or an overnight treatment through the ends.",
      categories: ["between-wash-oil"],
      prefer: { drugstore: [], luxury: ["amika-midnight-mender"], crueltyFree: [] },
    });
  }

  // Hands off (spec section 7 — frizz).
  if (c === "frizz") {
    steps.push({
      id: "hands-off",
      phase: "daily",
      title: "Hands off once it's dry",
      frequency: "All day",
      how: "Every touch roughs the cuticle back up and reintroduces frizz. Style it damp, then leave it alone — seriously, this one's free and it works.",
      noProducts: true,
    });
  }

  // -------------------------------------------------------------- AT NIGHT --
  // Night serum (6.4) — for everyone.
  steps.push({
    id: "night-serum",
    phase: "nightly",
    title: "Night serum + a light oil",
    frequency: "Nightly",
    how: "Two-layer night step: serum first (hydrates and repairs), then a drop of lightweight oil over it (seals it in). Your hair recovers overnight instead of rubbing itself dry.",
    categories: ["night-treatment"],
    prefer: {
      drugstore: ["loreal-midnight-serum", "loreal-miracle-serum", "dove-bond-shield-10in1"],
      luxury: ["kerastase-8h-night", "crown-affair-overnight"],
      crueltyFree: ["amika-midnight-mender"],
    },
    limit: 3,
  });

  // Scalp serum at night — thinning (3–4×/week) and slow growth (nightly massage).
  if (c === "thinning") {
    steps.push({
      id: "scalp-serum",
      phase: "nightly",
      title: "Scalp serum",
      frequency: "3–4 nights/week",
      how: "A few drops along the part lines, massaged in for a minute with fingertips. Consistency beats quantity here.",
      categories: ["scalp-serum"],
      prefer: {
        drugstore: ["mielle-rosemary-mint", "maple-holistics-biotin"],
        luxury: ["actacre-scalp-detox"],
        crueltyFree: ["vegamour-gro"],
      },
    });
  } else if (c === "slowGrowth") {
    steps.push({
      id: "scalp-massage-oil",
      phase: "nightly",
      title: "10-min scalp massage with oil",
      frequency: "Nightly",
      how: "Fingertips (never nails) or a scalp brush, working a growth oil or serum into the scalp for about 10 minutes. This is the anchor habit of the whole routine.",
      categories: ["scalp-serum"],
      principleId: "scalpMassage",
      prefer: {
        drugstore: ["mielle-rosemary-mint", "maple-holistics-biotin"],
        luxury: ["actacre-scalp-detox"],
        crueltyFree: ["vegamour-gro"],
      },
    });
  }

  // Protective style for sleep (6.4) — texture-aware, for everyone.
  // De-emphasized for short hair (spec §11.1): less length = less to protect,
  // so the pillowcase alone covers it.
  steps.push({
    id: "protect-style",
    phase: "nightly",
    title: shortHair
      ? "Silk or satin pillowcase"
      : curlyTexture
        ? "Pineapple + silk or satin"
        : "Loose braid + silk or satin",
    frequency: "Nightly",
    optional: shortHair,
    how: shortHair
      ? "Short hair gets off easy here — no braiding or pineapple needed. A silk/satin pillowcase (or bonnet) alone cuts the overnight friction that causes breakage and frizz."
      : curlyTexture
        ? "Gather curls into a loose, high “pineapple” pony to protect the pattern overnight, and sleep on silk or satin (pillowcase or bonnet)."
        : "A loose braid stops overnight tangling, and a silk/satin pillowcase or bonnet cuts the friction that causes breakage and frizz.",
    categories: ["tool-night"],
    principleId: "nightProtection",
    prefer: {
      drugstore: ["satin-pillowcase"],
      luxury: ["silk-pillowcase"],
      crueltyFree: ["satin-pillowcase"],
    },
    limit: 1,
  });

  // ------------------------------------------------------------------ NOTES --
  const notes = [];

  notes.push({
    id: "sweat-rule",
    title: "The sweat rule (refined)",
    body: [
      "Wash whenever works for you — there's no “correct” schedule. But if you sweat today (workout, hot day, anything), deal with it tonight — don't just let it air dry. Sweat, sebum, and salt sitting on the scalp for hours lead to buildup, odor, and irritation.",
      "Dry shampoo and a cool-air blow-dry at the scalp are both legit touch-ups between washes — but neither removes salt, sweat, or bacteria. They're stopgaps, not wash replacements.",
      "Sweat every day? You still don't need a deep clean daily — but plain water alone won't cut it either (it doesn't remove sweat, salt, or oil). Use a gentle sulfate-free shampoo — one wash is enough on light-sweat days — or a gentler natural option like a raw-sugar scalp scrub or rosemary-vinegar rinse. Keep clarifying washes to a few times a week.",
    ],
  });

  // 6.9 — hygral fatigue: air-drying isn't automatically healthier.
  notes.push({
    id: "air-dry",
    title: "Air-drying isn't automatically “healthier”",
    body: [
      "Hair swells when wet and contracts as it dries — and hours of staying wet (sleeping on wet hair, air-drying that drags on all day) slowly weakens its internal structure. It's called hygral fatigue, and medium/high-porosity hair feels it most.",
      "So don't avoid the blow dryer on principle: a quick, protected blow-dry — low heat, diffuser, heat protectant on first — can genuinely be gentler than hours of wetness. The rule of thumb is simply “avoid hours of wet,” not a specific timer.",
      ...(scalpOily
        ? [
            "Oily-scalp bonus move: a partial blow-dry, pointing the dryer straight down at the roots only (never the lengths or ends), speeds up root drying and can slow how fast your scalp re-oils — with zero heat on your ends.",
          ]
        : []),
    ],
  });

  // 6.15 — hard water & filtered showerheads.
  notes.push({
    id: "hard-water",
    title: "Check your water before blaming your products",
    body: [
      colorTreated
        ? "Hard water (high calcium/magnesium) leaves a mineral film that makes hair dull, dry, and hard to lather — and color-treated or bleached hair absorbs that buildup fastest, dulling and fading color sooner."
        : "Hard water (high calcium/magnesium) leaves a mineral film over time that makes hair feel dull, dry, and harder to lather or rinse clean.",
      "If you're in a hard-water area (most people don't know — a quick search for your city's water hardness settles it), a filtered showerhead is a one-time fix rather than another ongoing product, and it's especially worth it for color-treated hair.",
    ],
  });

  // 6.16 — 2-in-1s aren't all bad.
  notes.push({
    id: "two-in-one",
    title: "2-in-1s: fine as a shampoo, bad as your conditioner",
    body: [
      "2-in-1s are only a problem when they do BOTH jobs — using one as your conditioner replacement long-term shortchanges your hair. Used purely as a shampoo, they're fine.",
      "Standout: Head & Shoulders Tea Tree 2-in-1 is a genuinely good medicated wash for dandruff and itchy scalps. If medicated shampoo ever feels too intense, make it just the SECOND wash of a double-wash day instead of both washes.",
    ],
  });

  if (c === "thinning") {
    notes.push({
      id: "tight-styles",
      title: "Skip the tight hairstyles",
      body: [
        "Slicked-back ponies and tight braids pull on exactly the hairline you're trying to protect. Keep styles loose while you rebuild density.",
      ],
    });
    notes.push({
      id: "lifestyle",
      title: "If you're doing everything right and still thinning",
      body: [
        "Sometimes the cause isn't the routine at all. The unglamorous basics — 7+ hours of sleep, staying hydrated, managing stress — show up again and again in hair-shedding research.",
        "And if shedding is sudden, patchy, or persistent, it's worth asking a doctor about bloodwork (iron/ferritin, vitamin D, B12, zinc, thyroid). Not a diagnosis — just worth checking so you're not fighting a nutrient gap with shampoo.",
        "About biotin gummies: extra biotin only meaningfully helps if you're actually deficient — which is uncommon with a reasonably varied diet. If concerns persist despite a solid routine, that bloodwork is the useful move, not guessing with supplements.",
      ],
    });
  }

  if (c === "dryness" || c === "breakage") {
    notes.push({
      id: "trims",
      title: "Trim every 8–10 weeks",
      body: [
        "Split ends travel upward — a regular dusting keeps damage from climbing the strand. It feels counterproductive when you want length; it isn't.",
      ],
    });
  }
  if (c === "breakage") {
    notes.push({
      id: "towel",
      title: "Your towel is part of the problem",
      body: [
        "Regular terry-cloth towels have big, rough loops that snag the cuticle — that friction is what turns rubbing hair dry into frizz and mechanical breakage. Microfiber (or a cotton t-shirt) has a smoother, tighter weave: far less friction, still very absorbent.",
        "Same physics at night: tossing and turning on wet hair compounds the friction. Blot with microfiber, and never go to bed with wet hair.",
      ],
    });
  }
  if (c === "slowGrowth") {
    notes.push({
      id: "trims",
      title: "Regular trims (yes, really)",
      body: [
        "Trims don't make hair grow faster — they stop breakage from erasing the growth you already got. Keeping ends healthy is how length actually accumulates.",
      ],
    });
    notes.push({
      id: "biotin",
      title: "Honest word on biotin supplements",
      body: [
        "Biotin only meaningfully helps hair if you're actually deficient — uncommon with a reasonably varied diet, and the research behind most biotin-gummy marketing is weak for everyone else. If growth stays slow despite a solid routine, bloodwork for real deficiencies beats guessing with supplements.",
      ],
    });
  }

  if (chem.includes("boxDye")) {
    notes.push({
      id: "box-dye",
      title: "Before your next color appointment",
      body: [
        "At-home box dye contains metallic salts that build up in hair and can react unpredictably with future bleach or bond-repair services — sometimes causing gumminess or breakage.",
        "Use a clarifying/chelating shampoo (like L'Oréal Metal Detox) for a few washes before any future bleach or salon color, and always mention the box dye history to your stylist so they can strand-test first.",
      ],
    });
  }
  if (chem.includes("bleach")) {
    notes.push({
      id: "bleach",
      title: "Bleached hair plays by porosity rules",
      body: [
        "Bleached hair is usually high-porosity — it drinks moisture in and loses it just as fast. That's why your layering order is LCO (cream before oil), and why bond treatments should be a fixture in your routine, not a treat.",
        "Worth a look on the Luxury tab: Pureology Strength Cure Blonde — a violet-toning shampoo/conditioner system built for exactly this, toning brassiness while repairing lightened hair.",
      ],
    });
  }
  if (chem.includes("keratin")) {
    notes.push({
      id: "keratin",
      title: "Protect that keratin treatment",
      body: [
        "Sulfates strip smoothing treatments early — stick to sulfate-free washes to get your money's worth.",
      ],
    });
  }
  if (chem.includes("relaxer")) {
    notes.push({
      id: "relaxer",
      title: "Relaxed or permed hair needs gentle handling",
      body: [
        "Chemically restructured hair is most fragile when wet — detangle slowly with a wide-tooth comb, keep bond care regular, and space out any further chemical services.",
      ],
    });
  }

  if (answers.heat === "daily") {
    notes.push({
      id: "heat",
      title: "About that daily heat…",
      body: [
        "Cumulative heat is the quiet killer of ends. Protectant every single time, and try to swap in air-drying or heatless styles a couple of days a week — your future ends will thank you.",
      ],
    });
  }

  // Flaky scalp flagged without the full dandruff concern — give the
  // medicated-rotation advice as a note instead of rebuilding the routine.
  if (scalpFlaky && c !== "dandruff") {
    notes.push({
      id: "flaky-scalp",
      title: "For the flakes you mentioned",
      body: [
        "Rotate a medicated shampoo (pyrithione zinc or ketoconazole — Head & Shoulders or Nizoral) into your washes about twice a week. Use it as the second wash so it reaches skin instead of sitting on buildup, and keep the water warm, never hot.",
        "If flakes are painful, spreading, or haven't budged after a month of medicated washes, that's a dermatologist visit — not another product.",
      ],
    });
  }

  if (scalpSensitive) {
    notes.push({
      id: "sensitive",
      title: "Sensitive-scalp ground rules",
      body: [
        "Favor fragrance-light formulas, patch-test anything new behind your ear for a day or two, and keep rinse water warm rather than hot.",
      ],
    });
  }

  if (answers.density === "unsure") {
    notes.push({
      id: "start-light",
      title: "Not sure about your hair yet? Start light",
      body: [
        "Use half the product you think you need — you can always add more. If hair falls flat by midday, your products are too heavy; if the ends still feel thirsty, go a step richer.",
      ],
    });
  }

  // ------------------------------------------------------------- ASSEMBLE --
  const built = steps.map(makeStep);
  const phases = [
    {
      id: "washDay",
      title: "Wash Day",
      emoji: "🚿",
      intro: WASH_INTROS[answers.washFreq] || null,
      steps: built.filter((s) => s.phase === "washDay"),
    },
    {
      id: "daily",
      title: "Daily",
      emoji: "☀️",
      intro: null,
      steps: built.filter((s) => s.phase === "daily"),
    },
    {
      id: "nightly",
      title: "At Night",
      emoji: "🌙",
      intro: null,
      steps: built.filter((s) => s.phase === "nightly"),
    },
  ];

  return {
    summary: {
      headline: concern.headline,
      blurb: concern.blurb,
      concernLabel: concern.label,
      chips: [
        optionLabel("hairType", answers.hairType),
        `${optionLabel("length", answers.length)} length`,
        optionLabel("density", answers.density) === "Not sure"
          ? "Density TBD"
          : `${optionLabel("density", answers.density)} density`,
        scalpList.length > 0
          ? `${scalpList.map((s) => optionLabel("scalp", s)).join(" + ")} scalp`
          : "Scalp TBD",
        ...(goalList.length > 0
          ? [goalList.map((g) => optionLabel("goal", g)).join(" + ")]
          : []),
        DEPTH_LABELS[depth].split(" · ")[1],
      ],
    },
    depthLabel: DEPTH_LABELS[depth],
    defaultTier: TIER_KEYS.includes(answers.priority) ? answers.priority : "drugstore",
    phases,
    notes,
  };
}
