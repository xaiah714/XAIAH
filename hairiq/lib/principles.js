// ---------------------------------------------------------------------------
// HairIQ — General routine principles (spec section 6)
// Reusable copy blocks referenced across multiple concern routines.
// Each block: { id, title, summary, body: [paragraphs], steps?, options? }
// Steps/notes in the UI link to these by id and render them as expandable
// "why this works" details — edit copy here without touching components.
// ---------------------------------------------------------------------------

export const PRINCIPLES = {
  // 6.1 — Pre-wash oil treatment
  prePoo: {
    id: "prePoo",
    title: "Pre-wash oil treatment (“pre-poo”)",
    summary:
      "Oil on your mid-lengths and ends 10–20+ minutes before shampooing cuts friction and breakage during the wash. Every hair type can benefit.",
    body: [
      "Why coconut oil specifically: its fatty-acid structure lets it actually penetrate into the hair shaft rather than just sitting on the surface — the main reason it's the most-recommended pre-poo oil in the hair-science world. Oils like argan work more on the surface (great for shine and smoothness) but don't penetrate the same way.",
      "Buy a hair-specific coconut oil product, not the cooking jar. Hair-formulated versions are processed to be lighter and spread more easily, so they don't leave the waxy buildup that solid, unrefined cooking-grade coconut oil can.",
      "Fine or low-porosity hair? Use a lighter hand — or start with the weightless mist version — so it doesn't get weighed down. Argan oil is a good lighter alternative if coconut oil ever feels too heavy.",
    ],
  },

  // 6.2 / 6.10 — Scalp-aware washing & the refined sweat rule
  sweatRule: {
    id: "sweatRule",
    title: "The sweat rule",
    summary:
      "There's no fixed wash schedule — wash whenever works for you. One firm rule: if you sweat today, deal with it tonight.",
    body: [
      "If you sweat that day (workout, hot day, anything), don't just let it air dry. Sweat, sebum, and salt sitting on the scalp for hours can lead to buildup, odor, and irritation.",
      "Dry shampoo is fine between washes, but it is not a substitute here — it only absorbs surface oil. And a cool-air blow-dry at the scalp is a legit touch-up (dermatologists acknowledge it), but it only evaporates moisture; it doesn't remove salt, sweat, or bacteria either. Both are stopgaps, not wash replacements.",
      "Sweat daily? You still don't need a deep clean every day — but don't rely on plain water either; water alone doesn't really remove sweat, salt, or oil. The daily move is a gentle sulfate-free shampoo (one wash is enough on a light-sweat day — save double-washing for heavy buildup), or a gentler natural option like a raw-sugar scalp scrub or a rosemary-vinegar rinse. Keep clarifying washes to a few times a week.",
    ],
  },

  // 6.11 — Shampoo is for the scalp, not the ends
  scalpWash: {
    id: "scalpWash",
    title: "Shampoo is for your scalp, not your ends",
    summary:
      "Only the scalp actually needs washing — that's where oil, sweat, and buildup live. The lather rinsing through is enough for your lengths.",
    body: [
      "There are no oil glands on the hair shaft itself, so scrubbing shampoo into your ends every wash just dries them out. Wash the scalp; let the runoff handle the rest.",
      "Exception: if the ends feel grimy or product-heavy, a roughly monthly full-length “reset” wash is fine — it's just not an every-wash need.",
      "And wash frequency follows the scalp, not the hair: wash when the scalp feels oily, sweaty, or itchy. If it feels fine, there's no rule saying you're due.",
    ],
  },

  // 6.12 — Conditioner: how to apply, and why it's not optional
  conditionerWhy: {
    id: "conditionerWhy",
    title: "Conditioner isn't optional (and how to apply it)",
    summary:
      "Skipping conditioner doesn't prevent breakage — it causes it. Unconditioned hair tangles more, and tangles plus friction are exactly how hair snaps.",
    body: [
      "How to apply: split hair into two sections (more if it's very thick), and work conditioner from mid-lengths to ends only — never on the scalp. Needing a generous amount is normal, not overuse.",
      "Texture changes the dose: wavy, curly, and coily hair genuinely need more conditioner than straight hair — every bend in the strand exposes more cuticle, so it absorbs (and needs) more moisture to stay smooth. For curls and coils, a wet detangling brush is a great way to spread it evenly while detangling in the same step.",
      "What actually happens if you skip it: hair gets progressively harder to detangle, breaks more from friction, and dulls — and curly/coily hair also loses definition and frizzes faster. That's true for every hair type; textured hair just shows it soonest.",
    ],
  },

  // 6.13 — Brushing, corrected by hair type (wet vs. dry)
  brushing: {
    id: "brushing",
    title: "Wet or dry? Depends on your hair type",
    summary:
      "One rule for everyone: always detangle from the ends and work up toward the roots — never drag from the root down through a tangle.",
    body: [
      "Curly and coily hair: wet detangling only, never dry — dry brushing breaks curls and creates serious frizz. Detangle wet, with conditioner in.",
      "Wavy hair: two beautiful options. Option one — right out of the shower, brush your leave-in through towel-dried damp hair to spread the product (waves don't need to brush conditioner through in the shower like curls do; waiting until damp can mean less breakage). Option two — dry brush from the ends up for fluffy, voluminous waves, or on day 2–3 to detangle mid-lengths and stretch more days between washes.",
      "Straight hair: dry brushing is often the easier call — straight hair tangles less, and wet hair is more fragile for every hair type. If you do detangle wet, use a wide-tooth comb, gently.",
    ],
  },
  doubleWash: {
    id: "doubleWash",
    title: "Double-washing, explained",
    summary:
      "If your scalp feels heavy with product, sweat, or buildup — shampoo twice. Most people skip this without realizing.",
    body: [
      "The first wash breaks down surface buildup. The second is the one that actually cleanses the scalp — and it's when a medicated or treatment shampoo does its real work, so always use those as the second wash.",
      "One correction people get wrong: if your first wash is a clarifying shampoo, do NOT clarify twice. That squeaky-clean, stripped feeling means it already worked — follow it with a hydrating, non-clarifying shampoo for the second wash instead, so you cleanse without over-stripping.",
    ],
  },

  // 6.3 — Scalp massage: the why + fingertips vs. brush
  scalpMassage: {
    id: "scalpMassage",
    title: "Why scalp massage actually works",
    summary:
      "It's about blood flow: massage boosts circulation to the follicles, which carries more oxygen and nutrients to where hair is actually built.",
    body: [
      "The science, simply: hair grows from follicles fed by tiny blood vessels. Massaging increases local blood flow and gently stretches the skin, which signals the follicle cells themselves — small studies of daily massage found measurably thicker hair after a few months. The catch: consistency is everything. Ten minutes daily beats an hour once a week.",
      "Fingertips vs. a brush: fingertips (never nails — nails scratch and cause tiny tears) let you feel the pressure and hit every spot. A wood or bamboo scalp brush covers more ground with less hand fatigue, spreads oils and serums evenly, and gently exfoliates buildup while it stimulates. Both work — fingertips for precision, brush for convenience and exfoliation. Pick whichever you'll actually do every day.",
    ],
  },

  // 6.4 — Nighttime protection
  nightProtection: {
    id: "nightProtection",
    title: "Why the bonnet (and the braid) actually matter",
    summary:
      "You move a lot in your sleep — hours of hair rubbing on fabric and on itself is real, cumulative breakage and frizz.",
    body: [
      "The pillowcase handles part of it: a smooth satin or silk surface cuts friction where your head rests. But hair still rubs against itself and drags across fabric as you turn. A bonnet (or a loose braid) contains the hair — strand-on-strand friction drops, moisture stays in, and longer hair keeps its shape. Short hair can get away with the pillowcase alone; the longer your hair, the more the bonnet earns its spot.",
      "Fabric tiers, same physics: satin is the affordable version (around $10), mulberry silk is the luxury one — smoother and cooler, but the friction science is identical.",
      "Styling for sleep: a loose braid + bonnet/pillowcase for straight and wavy hair; a loose, high “pineapple” pony for curls and coils so the pattern survives the night.",
    ],
  },

  // 6.5 — K18 correct usage (rendered as its own "instructions" expander,
  // not under "why this works" — owner feedback, rev 6)
  k18: {
    id: "k18",
    title: "K18 instructions — step by step",
    linkLabel: "K18 instructions — step by step",
    summary:
      "K18 is a luxury product that's worth it even on a budget — science-backed, and nobody has successfully duped it. A little goes far, so use it right:",
    steps: [
      "Shampoo — and skip your regular rinse-out conditioner this wash (it can block the treatment from working).",
      "Towel-dry your hair until damp — and dry your HANDS too. K18 only emulsifies (turns thick, white, and creamy) in dry palms; on wet hands it just slides around and does less.",
      "Rub 1–3 pumps between your dry palms until it's creamy, so it spreads evenly before touching your hair.",
      "Apply from mid-lengths to ends, working upward — avoid the scalp — then SCRUNCH it in. Scrunching presses the product into the strands, and it works for every hair type, even straight.",
      "Leave it for 4 minutes.",
    ],
    options: {
      intro:
        "After the 4 minutes you've got two good options — don't skip this part out of confusion:",
      choices: [
        {
          label: "Leave it in",
          text: "Go straight to your leave-in conditioner and styling products. This is K18's official “leave-in treatment” use.",
        },
        {
          label: "Rinse + condition",
          text: "Rinse the K18 out, then apply your regular conditioner, wait however long that conditioner calls for, and rinse it out too. A lot of people find this gives noticeably softer hair and get more out of the K18 than skipping conditioner entirely — which is what most people accidentally do. The “no conditioner” rule in step 1 is only about before the treatment, not after.",
        },
      ],
    },
    body: [],
  },

  // 6.6 — UV protection
  uvProtection: {
    id: "uvProtection",
    title: "Summer sun & your hair",
    summary:
      "UV exposure can visibly change the color and texture of your ends over a single summer — especially on color-treated hair.",
    body: [
      "The easy fix isn't another 'before going outside' product to remember — just let a UV leave-in replace your regular leave-in for the whole summer. Worn every day, it covers sun, salt, and chlorine without adding a step.",
    ],
  },

  // 6.7 — Box dye caution
  boxDye: {
    id: "boxDye",
    title: "A heads-up about box dye",
    summary:
      "At-home box dye contains metallic salts that can build up in hair and react unpredictably with future bleach or bond-repair services — sometimes causing gumminess or breakage.",
    body: [
      "Before any future bleach or salon color: use a clarifying/chelating shampoo (e.g., L'Oréal Metal Detox) for a few washes first, and always mention your box dye history to your stylist so they can strand-test.",
    ],
  },

  // 6.8 — LOC / LCO
  loc: {
    id: "loc",
    title: "The LOC / LCO method",
    summary:
      "A three-layer system for locking in moisture — especially useful for curly, coily, or dry hair.",
    body: [
      "L — Liquid: water or a water-based leave-in, to actually hydrate the hair.",
      "O — Oil: a lightweight oil applied next, to seal that moisture in.",
      "C — Cream: a heavier cream or butter on top, to lock everything in and add definition.",
      "LOC order (oil before cream) tends to work better for low-porosity hair — the cuticle lies flatter, so a lighter oil layer first prevents product from just sitting on top.",
      "LCO order (cream before oil) tends to work better for high-porosity hair — bleached, damaged, or rough-feeling hair is usually higher porosity, and the heavier cream needs an oil layer on top to actually hold.",
    ],
  },

  // Section 7 — thinning lifestyle & root-cause note
  thinningLifestyle: {
    id: "thinningLifestyle",
    title: "If you're doing everything right and still thinning",
    summary:
      "Sometimes the cause isn't the routine at all — the basics below matter more than any product.",
    body: [
      "Aim for 7+ hours of sleep, stay hydrated, and find a stress outlet that actually works for you — all three show up again and again in hair-shedding research.",
      "If shedding is sudden, patchy, or persistent, it's worth asking a doctor about bloodwork: iron/ferritin, vitamin D, B12, zinc, and thyroid are the usual suspects. Not a diagnosis — just worth checking so you're not fighting a nutrient gap with shampoo.",
    ],
  },

  // Section 7 footer — dermatologist disclaimer
  dermDisclaimer: {
    id: "dermDisclaimer",
    title: "A note on scalp health",
    summary:
      "HairIQ gives cosmetic styling guidance, not medical treatment.",
    body: [
      "Persistent scalp issues — anything painful, spreading, or unresponsive to over-the-counter care — deserve a dermatologist visit, not just a routine change.",
    ],
  },
};

export function getPrinciple(id) {
  return PRINCIPLES[id] || null;
}
