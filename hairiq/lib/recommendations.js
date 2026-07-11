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
  weekly: "You wash weekly (or less) — make that one wash day count, and lean on the Every Day column to keep your scalp happy in between.",
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
      how: fine
        ? "A light coat of oil on mid-lengths and ends before you shampoo — use a light hand (or the weightless mist) so fine hair doesn't get weighed down."
        : "Coat mid-lengths and ends with oil 10–20+ minutes before you shampoo — it cushions hair against friction and breakage during the wash.",
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
          answers.scalp === "dry"
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
      principleId: answers.scalp === "oily" ? "doubleWash" : null,
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
      prefer: {
        drugstore: ["ogx-bond-shampoo", "loreal-everpure-bond-shampoo"],
        luxury: ["amika-kure-shampoo"],
        crueltyFree: ["olaplex-no4"],
      },
    });
  } else {
    steps.push({
      id: "shampoo",
      phase: "washDay",
      title: "Shampoo",
      frequency: "Every wash",
      how:
        answers.scalp === "oily"
          ? "Focus shampoo on the scalp, not the lengths — and when it feels heavy with product or sweat, double-wash."
          : answers.scalp === "dry"
            ? "Massage into the scalp and let the runoff clean the lengths — no need to scrub dry ends."
            : "A strengthening wash, massaged into the scalp with fingertips.",
      categories: ["strengthening-shampoo"],
      principleId: answers.scalp === "oily" ? "doubleWash" : null,
      prefer: {
        drugstore: [],
        luxury: [],
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
      how: chem.includes("boxDye")
        ? "Once a week, swap in a clarifying shampoo to reset buildup. With box dye in your history, make it a chelating formula (like Metal Detox) — see the note below about your next color appointment."
        : "Once a week, swap your regular shampoo for a clarifying one — it resets product and hard-water buildup so everything else works better.",
      categories: ["clarifying-shampoo"],
      prefer: {
        drugstore: chem.includes("boxDye") ? ["loreal-metal-detox"] : [],
        luxury: [],
        crueltyFree: [],
      },
    });
  }

  // Bond repair (8.1 / 8.3 / 8.5) — one step, pick one timing.
  const bondPrefer = {
    drugstore: ["loreal-everpure-bond-concentrate", "nym-tough-love-treatment"],
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
      how: "Bond repair is one step with three possible timings — not three separate steps, so don't stack all of them. In-shower is the standard starting point for most people; before- or after-shower are alternatives if a mid-shower step doesn't fit your routine (or an occasional extra boost on top if you want more). If you go with K18, follow the steps below so you don't waste product.",
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
      how: "One bond builder, weekly or as needed — in the shower, right after shampoo and before conditioner. If you go with K18, use it right — the steps below save you from wasting product (most people do).",
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
        ? "Mid-lengths and ends, every wash. On K18 washes, conditioner comes back in after the treatment window — see the K18 steps — not before."
        : c === "curlyNew"
          ? "Condition generously every wash — curls drink it up. This is also your detangling window (next step)."
          : answers.scalp === "oily"
            ? "Mid-lengths and ends only — keep conditioner off the roots."
            : "Mid-lengths and ends, every single wash.",
    categories: ["conditioner"],
    prefer: {
      drugstore:
        c === "breakage" ? ["ogx-bond-conditioner", "loreal-everpure-bond-conditioner"] : [],
      luxury:
        c === "curlyNew"
          ? ["devacurl-one-condition"]
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
        drugstore: ["cer100-protein"],
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

  // Leave-in + heat protectant (8.6) — always present.
  steps.push({
    id: "leave-in",
    phase: "washDay",
    title: answers.heat === "rarely" ? "Leave-in conditioner" : "Leave-in conditioner + heat protectant",
    frequency: "Every wash day",
    how:
      c === "curlyNew" || c === "frizz"
        ? `Apply liberally to soaking-wet hair — this is the L (liquid) of your ${locOrder} layers.`
        : answers.heat === "daily"
          ? "Apply liberally to damp hair, every wash day — and never let a hot tool touch bare hair."
          : "Apply liberally to damp hair, every wash day. This is the step that makes everything else look better.",
    categories: ["leave-in"],
    prefer: {
      drugstore: [],
      luxury: colorTreated ? ["pureology-color-fanatic"] : [],
      crueltyFree: [],
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
  if (c === "thinning" || (answers.goal === "scalpHealth" && c !== "slowGrowth" && c !== "dandruff")) {
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

  // UV protection (6.6) — seasonal, always on right now (summer).
  steps.push({
    id: "uv-shield",
    phase: "daily",
    title: "UV shield before time outside",
    frequency: "Sunny days",
    how: colorTreated
      ? "Sun can visibly shift color-treated hair over one summer — mist a UV spray on before heading out, like sunscreen for your hair."
      : "A summer of sun can change the color and texture of your ends — mist a UV spray on before heading out.",
    categories: ["uv-protect"],
    principleId: "uvProtection",
    prefer: {
      drugstore: ["pantene-sunkiss-glow"],
      luxury: [],
      crueltyFree: ["sunbum-heat-protector"],
    },
    limit: 2,
    emptyText: "No luxury UV pick in the library yet — Pantene Sunkiss Glow (Drugstore tab) is the one to grab.",
  });

  // The right brush for the texture (spec §11.2) — simple Q1 lookup.
  if (answers.hairType === "straight") {
    steps.push({
      id: "brush",
      phase: "daily",
      title: "Brush with boar bristle",
      frequency: "Daily-ish",
      how: "For straight hair, a boar bristle brush earns its spot: it carries your scalp's natural oils down the length for shine. Brush dry hair, roots to ends.",
      categories: ["tool-brush"],
      prefer: { drugstore: ["boar-bristle-brush"], luxury: ["boar-bristle-brush"], crueltyFree: ["boar-bristle-brush"] },
      limit: 1,
    });
  } else {
    steps.push({
      id: "brush",
      phase: "daily",
      title: "Use the right brush (a wet one)",
      frequency: "Wash day only",
      how: "Textured hair gets a wet detangling brush — flexible bristles that work through knots without snapping strands. Use it on wet hair with conditioner in, and never brush your texture dry.",
      categories: ["tool-brush"],
      prefer: { drugstore: ["wet-detangling-brush"], luxury: ["wet-detangling-brush"], crueltyFree: ["wet-detangling-brush"] },
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
    how: "Work a night serum through mid-lengths and ends, then seal with a drop of lightweight oil. Your hair repairs while you sleep instead of rubbing itself dry.",
    categories: ["night-treatment"],
    prefer: {
      drugstore: ["loreal-midnight-serum"],
      luxury: ["kerastase-8h-night"],
      crueltyFree: ["amika-midnight-mender"],
    },
    limit: 2,
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
    limit: 1,
  });

  // ------------------------------------------------------------------ NOTES --
  const notes = [];

  notes.push({
    id: "sweat-rule",
    title: "The sweat rule (the one non-negotiable)",
    body: [
      "Wash whenever works for you — there's no “correct” schedule. But if you sweat today (workout, hot day, anything), wash tonight. Don't just let it air dry: sweat, sebum, and salt sitting on the scalp for hours lead to buildup, odor, and irritation.",
      "Dry shampoo doesn't count here — it absorbs surface oil but doesn't remove sweat, salt, or bacteria from the scalp.",
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
  if (c === "slowGrowth") {
    notes.push({
      id: "trims",
      title: "Regular trims (yes, really)",
      body: [
        "Trims don't make hair grow faster — they stop breakage from erasing the growth you already got. Keeping ends healthy is how length actually accumulates.",
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

  if (answers.scalp === "sensitive") {
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
      title: "Every Day",
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
        `${optionLabel("scalp", answers.scalp)} scalp`,
        optionLabel("goal", answers.goal),
        DEPTH_LABELS[depth].split(" · ")[1],
      ],
    },
    depthLabel: DEPTH_LABELS[depth],
    defaultTier: TIER_KEYS.includes(answers.priority) ? answers.priority : "drugstore",
    phases,
    notes,
  };
}
