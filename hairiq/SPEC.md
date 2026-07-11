# Hair Care Routine App — Build Spec for Claude Code

> App name: TBD — using placeholder "HairIQ" throughout. Find/replace once you pick one.
>
> **Repo note:** this is the spec the app in this directory was built from
> (latest revision received July 11, 2026). Sections 1–10 are v1 and are
> implemented; Section 12 is the v2 roadmap and is intentionally NOT built —
> it needs its own planning session.

## 1. What This App Does
A quiz-based tool that takes someone's hair type, scalp condition, and goals, then generates
a personalized hair-care routine with specific product recommendations across three lenses —
Drugstore, Luxury, and Cruelty-Free — calculated regardless of quiz answer so the
user can switch tabs anytime.

**v1 scope:** No login, no email capture. Pure quiz → results. Architecture should leave
room to bolt on accounts/saved routines later (v2).

## 2. Tech Stack (recommended default)
- Next.js + React + Tailwind CSS
- All state client-side (React state/context) — no database needed for v1
- Recommendation logic as a single JS lookup object/function, kept separate from UI
  so content can be edited later without touching components
- v2 note: when accounts are added, this is where Postgres + auth (e.g. NextAuth) slots in

## 3. Visual Design — Pastel Pink & Orange Theme
| Role | Color | Hex |
|---|---|---|
| Background | Ivory/cream | `#FFF9F4` |
| Primary accent (CTAs) | Pastel coral-orange | `#FFAB91` |
| Secondary accent | Pastel pink | `#FFD1DC` |
| Badge/tag accent 1 | Pastel yellow | `#FFE9A8` |
| Badge/tag accent 2 | Pastel green | `#C8E6C9` |
| Text | Warm cocoa brown | `#5A3E36` |

- Fonts: rounded, friendly sans-serif — Poppins or Quicksand for headings, Nunito or
  Inter for body text
- Buttons: pill-shaped, soft drop shadow, large tap targets (mobile-first)
- Use the yellow/green accents as small badges on product cards (e.g., a green
  "Cruelty-Free" tag, a yellow "New" tag) — keep the core UI to pink + orange, pull in
  yellow/green only as accents so it doesn't get visually noisy
- ADHD-friendly rule: **one decision per screen.** Never show more than one question
  or one primary CTA at a time.

## 4. Screens / User Flow
1. **Landing** — logo placeholder, one-line tagline, single CTA: "Take the Quiz"
2. **Quiz** — one question per screen, progress bar at top, big tappable answer
   cards (not tiny radio buttons), Back + Next nav
3. **Results** — routine card(s) broken into Wash Day / Daily / Nightly steps, a
   3-way tab: **Drugstore | Luxury | Cruelty-Free** (always live, all three
   are pre-calculated), "Retake Quiz" button, and a disabled "Save My Routine"
   button labeled "Coming soon" (placeholder for v2 accounts)

## 5. Quiz Questions (10 — single-select unless noted, one per screen)
1. Hair type: Straight / Wavy / Curly / Coily
2. Hair density: Fine / Medium / Thick / **Not sure — new to this**
3. Scalp type: Oily / Dry & flaky / Sensitive or irritated / Balanced
4. **Main concern** (primary driver of results): Thinning or density loss /
   Dryness or damage / Frizz / Breakage & split ends / Dandruff or flaking /
   Slow growth / **New to curly or wavy — need a styling routine**
5. Main goal: Grow it longer / Increase density / Repair damage / Reduce
   frizz / Improve scalp health / Just maintain
6. Chemical treatments (**multi-select**): Salon color, no bleach / Bleached /
   Box dye at home, no bleach / Relaxed or permed / Keratin or smoothing
   treatment / None
7. Heat styling frequency: Daily / A few times a week / Rarely or never
8. Wash frequency: Daily / Every other day / Twice a week / Weekly or less
9. Time available for a routine: 5 min or less / 10–15 min / 20+ min
10. What matters most in product picks: Budget-friendly (drugstore) / Luxury /
    Cruelty-free — (note: this only sets the *default* results tab; all
    three tiers are always calculated and viewable)

## 6. General Routine Principles (cross-cutting logic)

### 6.1 Pre-Wash Oil Treatment ("Pre-Poo") — recommend for ALL hair types
- Apply oil to mid-lengths and ends 10–20+ min before shampooing on wash day —
  reduces friction and breakage during washing. Everyone can benefit, though fine
  or low-porosity hair should use a lighter hand so it doesn't get weighed down.
- **Why coconut oil specifically:** its fatty-acid structure lets it actually
  penetrate into the hair shaft rather than just sitting on the surface — the
  main reason it's the most-recommended pre-poo oil in the hair-science world.
  Other oils like argan work more on the surface (great for shine/smoothness)
  but don't penetrate the same way.
- **Buy a hair-specific coconut oil product, not the cooking jar.** Hair-formulated
  versions (e.g., OGX Coconut Miracle Oil Penetrating Oil) are processed to be
  lighter and spread more easily, so they don't leave the same waxy buildup that
  solid, unrefined cooking-grade coconut oil can.
- Give both weights as options: OGX Coconut Miracle Oil (original, more intense
  treatment) and OGX Coconut Miracle Oil weightless spray/mist version (lighter,
  good for finer hair or first-timers). Argan oil can still be offered as a
  lighter alternative for people who find coconut oil too heavy.

### 6.2 Scalp-Aware Washing & the Sweat Rule
- There's no fixed "wash schedule" — let people wash whenever works for them.
- One firm rule: **if you sweat that day (workout, hot day, etc.), wash your
  hair after, don't just let it air dry.** Sweat, sebum, and salt sitting on the
  scalp for hours can lead to buildup, odor, and irritation.
- Dry shampoo is fine between washes, but it is **not a substitute** for washing
  after sweating — it only absorbs surface oil, it doesn't actually remove sweat,
  salt, or bacteria from the scalp.
- **Double-washing:** if scalp feels heavy with product/sweat/buildup, shampoo
  twice — the first wash breaks down surface buildup, the second actually
  cleanses the scalp (and is when a medicated/treatment shampoo does its real work).

### 6.3 Scalp Massage Tools
- Fingertip massage (never nails) is the default 10-min daily technique.
- Also recommend a cheap wood or bamboo-style scalp massage brush (widely
  available in multi-packs for ~$10 on Amazon) as an option — it helps
  distribute product, gently exfoliates buildup, and the added stimulation
  may support scalp circulation.

### 6.4 Nighttime Hair Protection Routine
- Friction and movement while sleeping cause mechanical breakage, dryness,
  and frizz over time — worth a dedicated night step, especially for long hair.
- Example luxury pick: Kérastase Nutritive 8H Magic Night Serum Hydrating
  Treatment, followed by a lightweight hair oil.
- Drugstore dupe: L'Oréal Paris Elvive Extraordinary Oil Midnight Serum —
  commonly cited as a similar, much cheaper alternative to the Kérastase serum.
- Protective styling for sleep: loose braid + silk/satin bonnet or pillowcase
  for straight/wavy hair; a loose high "pineapple" pony for curly/coily hair
  to protect the curl pattern overnight.
- Works for any hair type — just adjust the styling step to the texture.

### 6.5 Bond Treatment — K18 as the Staple Pick
Always include K18 Leave-In Molecular Repair Hair Mask as a bond-treatment
option. Correct usage (a lot of people use it wrong and waste product):
1. Shampoo — skip your regular rinse-out conditioner this wash (it can block
   the treatment from working)
2. Towel-dry until damp, not dripping
3. Rub 1–3 pumps between your palms first so it distributes evenly before
   touching your hair (helps avoid over-applying and wasting product)
4. Apply from mid-lengths to ends, working upward — avoid the scalp
5. Leave 4 minutes
6. Now you've got two good options — call this out clearly in the app so
   people don't skip it out of confusion:
   - **Leave it in:** go straight to your leave-in conditioner and styling
     products (K18's official "leave-in treatment" use)
   - **Rinse + condition:** rinse the K18 out, then apply your regular
     conditioner, wait however long that conditioner calls for, and rinse
     it out too — a lot of people find this gives noticeably softer hair
     and get more out of the K18 than they would skipping conditioner
     entirely (which is what most people accidentally do, thinking they
     can't use conditioner at all after K18 — that "no conditioner" rule
     in step 1 is only about *before* the treatment, not after)

### 6.6 Sun & UV Protection (seasonal, relevant now in summer)
- UV exposure can visibly change the color/texture of ends over a summer,
  especially on color-treated hair.
- Recommend a leave-in UV protection spray — e.g., Pantene Sunkiss Glow
  (2026 launch), which targets UV, salt, and chlorine exposure specifically.

### 6.7 Chemical Processing Caution (box dye / bleach)
- At-home box dye contains metallic salts that can build up in hair and react
  unpredictably with future bleach or bond-repair services (sometimes causing
  gumminess or breakage). If Q6 flags box dye use, show a note recommending a
  clarifying/chelating shampoo before any future bleach or salon color, and
  mentioning the box dye history to a stylist.

### 6.8 The LOC / LCO Method, Explained
For locking in moisture (especially relevant for curly/coily/dry hair):
- **L — Liquid:** water or a water-based leave-in, to actually hydrate the hair
- **O — Oil:** a lightweight oil applied next, to seal that moisture in
- **C — Cream:** a heavier cream or butter on top, to lock everything in and
  add definition
- **LOC order** (oil before cream) tends to work better for **low-porosity**
  hair — the cuticle lies flatter, so a lighter oil layer first prevents
  product from just sitting on top.
- **LCO order** (cream before oil) tends to work better for **high-porosity**
  hair — the cuticle is more open/rough, so it needs the heavier cream sealed
  in by an oil layer on top to actually hold.

These are common, non-proprietary hair-care practices — safe to build directly
into the app's logic.

## 7. Recommendation Engine — Starter Content
Primary lookup key = answer to Q4 (Main Concern). Each concern lists a routine
plus three product lenses — Drugstore, Luxury, and Cruelty-Free (this tab no
longer requires "vegan" too, which opens it up to a much wider pool of
brands — see 8.10 and Section 10). These are starter picks — review for
current availability/formulation before shipping.

> **Ethics note:** cruelty-free status can change with company ownership or
> regional laws (e.g., China's animal-testing requirements) — verify current
> certification via Leaping Bunny or PETA's Beauty Without Bunnies list
> before finalizing the "Cruelty-Free" picks.

**Thinning / Density Loss**
- Routine: 10-min scalp massage daily (see 6.3); scalp serum 3–4x/week at
  night; growth-supporting shampoo on wash days; avoid tight hairstyles
  pulling on the hairline; pre-poo per 6.1
- Drugstore: Mielle Rosemary Mint Scalp & Strengthening Oil; OGX Thick & Full
  Biotin & Collagen Shampoo
- Luxury: Act+Acre Cold Processed Scalp Detox
- Cruelty-Free: Vegamour GRO Hair Serum; Briogeo Scalp Revival Scrub
- **Lifestyle & root-cause note (show under this routine):** if someone's doing
  everything right topically and still seeing thinning, the cause may not be
  the routine at all. Include a gentle note covering: 7+ hours of sleep, staying
  hydrated, managing stress, and asking a doctor about bloodwork (iron/ferritin,
  vitamin D, B12, zinc, thyroid) if shedding is sudden, patchy, or persistent.
  Frame as "worth checking with a doctor," not a diagnosis.

**Dryness / Damage**
- Routine: pre-poo per 6.1; deep conditioning mask 1x/week (15–20 min, shower
  cap or warm towel); leave-in conditioner every wash day; trim every 8–10 weeks
- Drugstore: OGX Coconut Miracle Oil Mask; Aussie 3 Minute Miracle
- Luxury: Olaplex No.3 Hair Perfector
- Cruelty-Free: Briogeo Don't Despair, Repair! Mask; Innersense Hydrating
  Cream Conditioner

**Frizz**
- Routine: LOC/LCO method per 6.8; microfiber towel or t-shirt to dry (not
  rough terry); avoid touching hair once dry
- Drugstore: OGX Anti-Frizz Argan Oil Serum; Not Your Mother's Frizz Go Away
- Luxury: Living Proof No Frizz Leave-In Conditioner
- Cruelty-Free: Rahua Frizz-Free Cream; Bread Beauty Supply Hair Oil

**Breakage / Split Ends**
- Routine: bond-repair treatment on wash days (K18 per 6.5); silk/satin
  pillowcase or nighttime bonnet per 6.4; only detangle wet hair with a
  wide-tooth comb; trim every 8–10 weeks
- Drugstore: OGX Bond Repair Shampoo/Conditioner; L'Oréal EverPure Bond
  Strengthening line
- Luxury: K18 Leave-In Molecular Repair Mask
- Cruelty-Free: Olaplex No.4/No.5; K18 Leave-In Molecular Repair Mask (both
  brands are cruelty-free — Olaplex per brand claim, K18 independently
  certified — fine to show here even though they read "luxury-ish")

**Dandruff / Flaking Scalp**
- Routine: medicated shampoo 2x/week alternating with a gentle daily shampoo
  (see double-washing, 6.2); avoid hot water directly on scalp; scalp
  exfoliation 1x/week (scalp brush per 6.3)
- Drugstore: Nizoral Anti-Dandruff Shampoo; Head & Shoulders (works well as
  one wash within a double-wash routine — it doesn't have to replace someone's
  whole shampoo/conditioner system, just swap it in for the second wash)
- Luxury: Christophe Robin Purifying Scalp Scrub
- Cruelty-Free: Briogeo Scalp Revival Charcoal + Coconut Oil Scrub; Derma E
  Scalp Relief Shampoo

**Slow Growth**
- Routine: 10-min nightly scalp massage with oil (6.3); growth serum on scalp;
  monthly protein treatment; regular trims to offset breakage
- Drugstore: Mielle Rosemary Mint Oil; Maple Holistics Biotin Growth Serum
- Luxury: Act+Acre scalp treatments
- Cruelty-Free: Vegamour GRO Serum

**New to Curly/Wavy — Styling Basics**
- Routine: sulfate-free shampoo or co-wash on wash days; LOC/LCO method per
  6.8 on soaking-wet hair; scrunch upward, plop with a microfiber towel or
  old t-shirt for 10–15 min; diffuse on low heat or air-dry; never brush dry
  hair — detangle only with fingers or a wide-tooth comb while conditioner
  is still in; refresh day 2–3 with water + a small amount of leave-in;
  loose "pineapple" pony at night per 6.4
- Drugstore: Cantu Coconut Curling Cream; Aussie Miracle Curls Air Dry Cream
- Luxury: DevaCurl One Condition Original; Ouidad Climate Control Gel
- Cruelty-Free: Innersense Curl Crème; Bread Beauty Supply Curl Whip;
  DevaCurl One Condition Original (DevaCurl is PETA-certified cruelty-free —
  it's already your Luxury pick here too, so it can do double duty)

> Note: this tool gives cosmetic styling guidance, not medical treatment.
> Persistent scalp issues (painful, spreading, or unresponsive to OTC care)
> should be flagged to see a dermatologist rather than routine-only.

## 8. Extended Product Library — Full Routine Framework
Section 7 gives fast, concern-based defaults, but don't limit the app to
only those picks. This is the fuller product library — pulled from a
widely-referenced 11-step routine framework — that Claude Code should draw
from for the Drugstore and Luxury tiers across the app. Every product below
should end up in the product data somewhere; Section 7's picks are the
highlighted defaults, not the ceiling.

This follows the same four-phase structure as Section 6: Pre-Shower →
In-Shower → Post-Shower → Between-Wash. Steps marked *optional* can be
skipped entirely; core steps (shampoo, conditioning, leave-in) should
always be present in some form.

### 8.1 Pre-Shower (optional)
**Pre-shampoo bond repair treatment** (1–2x/week) — apply ≥10 min before
washing. Options: a dedicated pre-shampoo spray, or any of the bond-repair
products from 8.3 used before shampoo instead of after.

**Pre-shampoo oil treatment** (as needed) — see 6.1 for the coconut-oil
science and timing; this is where those products sit in the step order.

### 8.2 In-Shower — Shampoo
**Clarifying** (≥1x/week): L'Oréal EverPure Sulfate-Free, Garnier Fructis
Pure Clean, Dove Scalp+Hair Therapy Clarifying, Pantene Pro-V Volume & Body,
L'Oréal Metal Detox, Living Proof Clarifying Detox Shampoo, K18 Peptide Prep
Detox Shampoo, OUAI Detox Shampoo

**Non-clarifying / strengthening** (as often as needed): Garnier Fructis
Hair Filler + Vitamin Cg Shampoo, Not Your Mother's Tough Love Bonding
Shampoo, Dove Intensive Repair Shampoo, Dove Bond Strength Shampoo, L'Oréal
EverPure Bond Repair Shampoo, Pureology Strength Cure Shampoo, amika the
kure Bond Repair Shampoo, Redken Acidic Bonding Concentrate Shampoo

**Medicated** (optional, as needed for itching/irritation/flaking — in
place of or alongside the above): Neutrogena Scalp Therapy Anti-Dandruff,
Nizoral Anti-Dandruff, Dove Dryness & Itch Relief, CeraVe Anti-Dandruff
Hydrating Shampoo, Head & Shoulders Classic Clean (see 6.2 for the
double-wash technique)

### 8.3 In-Shower — Bond Repair Treatment
Frequency varies: K18 as needed (roughly once every few weeks — see 6.5 for
correct usage); the rest weekly or more if needed. Options: Garnier Fructis
Hair Filler + Bonding Treatment, OGX Bond Protein Repair (pre-shampoo
formula), Not Your Mother's Tough Love Intense Bonding Treatment, L'Oréal
EverPure Bond Repair Concentrate, Redken Acidic Bonding Concentrate, Pantene
Pro-Vitamin Essence Weightless Leave-On Treatment, K18 Leave-In Molecular
Repair Mask

### 8.4 In-Shower — Conditioning
Pick 1–2 every wash; can combine (gloss + conditioner, gloss + mask,
conditioner + mask).

**Gloss:** L'Oréal Elvive 8 Second Wonder Water, L'Oréal EverPure Glossing
5-Min Lamination Mask, amika flash Instant Shine Mask, L'Oréal Elvive
Glycolic Gloss 5-Min Lamination

**Conditioner:** Garnier Fructis Hair Filler + Vitamin Cg Conditioner, Not
Your Mother's Tough Love Bonding Conditioner, Dove Intensive Repair
Conditioner, Dove Bond Strength Conditioner, L'Oréal EverPure Bond Repair
Conditioner, Pureology Strength Cure Conditioner, amika the kure Bond Repair
Conditioner, Redken Acidic Bonding Concentrate Conditioner

**Mask:** CER-100 Collagen Ceramide Cooling Protein Treatment, Pantene
Miracle Rescue Deep Repair Conditioner, Pantene Miracle Rescue Intensive
Bond Repair Mask, OGX Bond Protein Repair 3-Minute Treatment Mask, Dove
10-in-1 Serum Mask Intensive Repair, Dove 10-in-1 Serum Mask Bond Strength,
amika the kure Intense Repair Mask

### 8.5 Post-Shower — Bond Repair (optional, 1–2x/week; optional if already
using an in-shower bond treatment)
Living Proof Triple Bond Complex Hair Strengthener — apply post-wash, wait
10 minutes before any other product

### 8.6 Post-Shower — Leave-In Conditioner & Heat Protectant (every wash
day, apply liberally)
Pantene Miracle Rescue 10-in-1 Multitasking Spray, TRESemmé Protecting Heat
Spray, TRESemmé Keratin Smooth Blowout Heat Protect Spray, Not Your Mother's
Tough Love Bonding Leave-In Protector, OGX Bond Protein Repair Leave-In
Spray, L'Oréal EverPure Moisture 2-in-1 Spray, Redken One United Multi-
Benefit Spray, Pureology Color Fanatic, Bumble and bumble Hairdresser's
Invisible Oil Primer

### 8.7 Post-Shower — Styling (optional, any order, personal preference)
TRESemmé Dry Texture Finishing Hairspray, Living Proof Full Dry Volume &
Texture Spray, Oribe Dry Texturizing Spray, K18 AstroLift Reparative Volume
Spray, TRESemmé Amplified Volume Mousse, R+Co Grasp Shaping Balm

### 8.8 Post-Shower — Style Sealers (optional, for extra conditioning/
smoothing/shine after a leave-in spray)
**Serum:** Garnier Fructis Strength Repair Serum, Redken Acidic Bonding
Concentrate 24/7 Serum, Pureology Strength Cure Dream Healer Serum

**Lotion/Cream:** Pantene Miracle Rescue 3-in-1 Multitasking Conditioner,
L'Oréal Elvive Total Repair 5 Protein Recharge, L'Oréal EverPure Weightless
Blow Dry Primer, Redken Acidic Bonding Concentrate Leave-In Treatment,
Bumble and bumble Hairdresser's Invisible Oil Long Last Styling Cream

**Oil:** OGX Bond Protein Repair Oil Mist, OGX Argan Oil of Morocco
Penetrating Oil, Dove Intensive Repair Oil, Dove Bond Shield Oil, Living
Proof Vanishing Oil, amika Superfruit Star Lightweight Styling Oil, Bumble
and bumble Hairdresser's Invisible Oil (the OGX coconut oils from 8.1 work
here too)

### 8.9 Between-Wash Care (all optional)
**Conditioning treatment or oil** (for dry/tangled hair between washes):
amika Midnight Mender Overnight Strength Repair Treatment, OGX Coconut Oil
Weightless Hydrating Oil, Dove Bond Shield, OGX Argan Oil of Morocco, amika
Superfruit Star, Bumble and bumble Hairdresser's Invisible Oil

**Heat protection** (before hot tools between washes): Living Proof Perfect
Hair Day Heat Styling Spray, IGK Good Behavior Spirulina Protein Smoothing
Spray, Moroccanoil Perfect Defense, Oribe Gold Lust Dry Heat Protection Spray

**Dry shampoo** (refresh greasy roots — not a replacement for washing, see
6.2): amika Perk Up Plus Extended Clean Dry Shampoo, Living Proof Perfect
Hair Day Advanced Clean Dry Shampoo, Dove Volume & Fullness Advanced Dry
Shampoo, Not Your Mother's Clean Freak Refreshing Dry Shampoo

### 8.10 Drugstore vs. Luxury Split (for tagging in the product data)
- **Drugstore:** Garnier Fructis, OGX, Dove, Pantene, TRESemmé, L'Oréal
  (Elvive/EverPure), Not Your Mother's, CeraVe, Neutrogena, Nizoral, Head &
  Shoulders, CER-100
- **Luxury:** K18, Living Proof, Redken, Pureology, amika, Oribe,
  Moroccanoil, Bumble and bumble, IGK, R+Co, epres
- **Cruelty-Free tab:** dropping "vegan" as a requirement means several
  brands already in this library qualify directly — **K18** (vegan +
  cruelty-free certified), **amika** (Leaping Bunny + PETA certified),
  **R+Co** (Leaping Bunny certified), **DevaCurl** (PETA certified), and
  **Oribe** (cruelty-free itself, though parent company Kao is not — see
  Section 10 for how we're treating that). The rest of this library
  (Garnier, OGX, Dove, Pantene, TRESemmé, L'Oréal, Not Your Mother's [not
  certified but widely reported cruelty-free by independent trackers],
  CeraVe, Neutrogena, Nizoral, Head & Shoulders, Living Proof, Redken,
  Pureology, Moroccanoil, IGK, Bumble and bumble, epres, CER-100) hasn't
  been verified either way — don't assume cruelty-free status without
  checking. Section 7 and Section 10 have more confirmed options for this
  tab; verify certifications per Section 7's note before launch.

## 9. Time-Based Routine Depth
Use Q9 (time available) to decide how many steps from Section 8 show on the
results page, layered on top of the concern-specific routine from Section 7:

- **5 min or less → Core:** non-clarifying shampoo + one conditioning pick
  (8.4) + leave-in/heat protectant (8.6). Skip everything else.
- **10–15 min → Standard:** Core, plus a weekly clarifying shampoo rotation
  (8.2), one in-shower bond treatment (8.3), and basic styling if relevant
  (8.7).
- **20+ min → Full:** the entire framework — pre-shower treatments (8.1),
  full shower sequence (8.2–8.4), post-shower bond repair (8.5), style
  sealers (8.8), and between-wash care as needed (8.9).

## 10. Expanded Cruelty-Free Library (living document — keep adding as we learn more)
Research pass completed July 2026. Per your call, this tab dropped "vegan"
as a requirement — it's cruelty-free only now, which widens the pool a lot.
Brands that are cruelty-free but not fully vegan (DevaCurl, Not Your
Mother's, Olaplex) now qualify cleanly, no caveat needed.

**Already in Section 8's Drugstore/Luxury library — cross-tag these too:**
- **amika** — Leaping Bunny + PETA certified cruelty-free (bonus: mostly
  vegan too, with a few exceptions containing keratin, honey, or lanolin).
- **R+Co** — Leaping Bunny certified cruelty-free (100% vegan too).
- **K18** — cruelty-free certified (vegan too).
- **DevaCurl** — PETA-certified cruelty-free. Owned by Henkel, whose other
  brands are not cruelty-free — your call whether that matters, but DevaCurl
  itself is independently certified.
- **Not Your Mother's** — widely reported cruelty-free by independent
  trackers (Ethical Elephant, Cruelty-Free Kitty), though not officially
  Leaping Bunny/PETA certified.
- **Olaplex** — brand states cruelty-free, approved by independent tracker
  Cruelty-Free Kitty, though no official Leaping Bunny/PETA certification.
- **Oribe** — cruelty-free itself; parent company Kao is not (same
  independent-subsidiary situation as DevaCurl/Henkel).

**New cruelty-free brands to add, by category:**

*Shampoo & conditioner:* Aveda (Leaping Bunny certified, also 100% vegan —
full range including scalp care), Pacifica Beauty (budget/drugstore-
friendly, at Target), Verb (good for fine hair), CurlSmith (protein-free
formulas for curly hair), ACURE (Leaping Bunny + PETA certified, B Corp,
affordable), Giovanni (salon-quality, affordable), Ethique (shampoo bars,
zero-waste), Paul Mitchell (cruelty-free since 1980, Leaping Bunny + PETA
certified)

*Medicated / dandruff shampoo:* Derma E Scalp Relief Shampoo, JASON
Dandruff Relief Shampoo (alternative to Head & Shoulders), Oribe Serene
Scalp Anti-Dandruff Shampoo (see Oribe/Kao note above)

*Bond repair / treatment:* K18, Olaplex

*Styling / serum / oil:* JVN — Jonathan Van Ness's line (Leaping Bunny
certified), Playa Ritual Hair Oil (natural coconut/apricot/sunflower oil
blend)

*Heat protection:* Sun Bum (heat protectant spray)

*Dry shampoo:* amika Perk Up Plus (already in Section 8 — cross-tag per
above)

**Next research pass ideas** (not yet verified — check before adding):
whether Living Proof, Moroccanoil, IGK, Redken, or Pureology (all already in
Section 8) have any independent cruelty-free certification, since that
would open up more free cross-tagging; a dedicated cruelty-free clarifying
shampoo (most picks above are general-purpose, not clarifying-specific);
Noughty Haircare and Cake Beauty (mentioned as cruelty-free drugstore
options, not yet checked against our category needs); Verb and CurlSmith
bond-repair or mask options if they exist.

## 12. v2 Roadmap — Monetization & Feature Expansion

**Heads up on scope:** v1 (already built) intentionally has no login, no
database, no backend — see Sections 1–2. Almost everything below requires
that foundation to exist first. This is a real step up in complexity from
v1, not a small add-on. Suggested phasing is at the bottom of this section
so Claude Code doesn't try to build all of it at once.

### 12.1 Tier Breakdown

> **Copy note:** never call the free tier a "trial" anywhere in the UI —
> it's not time-limited, it's a permanent free feature set. Word it as
> "free" / "included," not "trial."

**Free tier:**
- Take the quiz, get the personalized routine + recommendations across all
  three product tabs (this is everything v1 already does)
- Can retake the quiz anytime, but results aren't saved — each retake
  replaces the last one, no history (assumption — flagged as an open
  decision below, confirm or adjust)

**Paid tier** (price/model TBD — $1.99 one-time vs. subscription vs. free
is still undecided; don't hardcode a number, keep it in one config value):
1. Expanded product recommendations — more options per concern/tier, not
   just the 1–2 starter picks in Section 7
2. Unlimited quiz retakes **with saved history** — track how concerns
   change over time instead of overwriting the last result
3. Hair Care Tracker (see 12.2)
4. Where to Buy (see 12.3)
5. Price Drop Notifications (see 12.4)
6. Haircut Recommendations (see 12.5)
7. Hair Color Section (see 12.6)

### 12.2 Hair Care Tracker
- Daily/wash-day logging: which products were used, which steps from
  Sections 6–8 were done
- Non-wash-day logging: scalp massages, serums, night routine steps,
  anything else from the routine
- Custom goals/habits the user sets for themselves
- **Progress photos:** upload a photo, auto-timestamp it (no manual date
  entry), gallery view for side-by-side before/after comparison over time
- Needs: accounts, a database, and photo storage (e.g., S3 or Cloudinary)

### 12.3 Where to Buy
- **Online:** per product, link out to that product's page/search result on
  major retailers (Amazon, Target.com, Ulta.com, Walmart.com, CVS.com)
- **In-person:** use device location to point at nearby stores. Start
  simple — link to each retailer's own store-locator page pre-filled with
  the user's location, rather than building live inventory lookups. Most
  retailers don't expose a public real-time inventory API, so a from-
  scratch "is this in stock near me" system is a much bigger lift than it
  sounds — the store-locator-link approach gets 90% of the value for a
  fraction of the work
- Needs: device geolocation (browser API, no account required for this
  part specifically)

### 12.4 Price Drop Notifications
This is the most technically complex feature in the whole list — flag it
as the highest-risk item.
- Goal: track products the user has used/saved, notify them of price
  changes in both directions — drops ("This shampoo is $5 off at Target
  right now") and increases ("Price went up — might not be the best time
  to restock this one")
- Problem: most retailers don't offer public price APIs, so this either
  needs a third-party price-tracking service/API, or in-house scraping
  (fragile, and some retailers' terms of service restrict it)
- **Recommendation:** research existing price-tracking APIs/services
  before committing to build this in-house. If nothing suitable turns up,
  consider shipping a lighter v1 of this feature first — a manually
  curated "deals we noticed" feed — before attempting full automation
- Needs: accounts, a scheduled background job, and push or email
  notifications

### 12.5 Haircut Recommendations
- Organized by goal, not just hair type: maximize thickness/density
  retention, add volume, reduce bulk, shape curly hair, encourage growth,
  face-framing, etc.
- Each goal maps to specific cut styles with a description of *why* it
  achieves that goal — e.g., a blunt cut with a U-shape plus face-framing
  layers keeps ends maximally thick while still framing the face; for
  curly hair, shape goals can be specific too — e.g., "my curls look too
  triangular, I want a rounder silhouette" maps to a different cut
  approach than a thickness or volume goal
- Cover **dusting** (trimming a tiny amount off the ends, less than a full
  trim) as its own option alongside regular haircuts — good for people who
  want to manage split ends without losing length
- **Watch-out callout:** include a caution against at-home split-end-
  removal gadgets/machines — flag these as generally not recommended by
  hair professionals rather than a real substitute for dusting/trimming
- Inspiration photos per style
- Lower technical complexity than 12.2–12.4 — this is mostly a content
  library like Section 8, no new backend infrastructure needed beyond
  image hosting. Could realistically ship earlier/in parallel with other
  v2 work

### 12.6 Hair Color Section
- Categories: Going Blonde, Going Darker, Bleaching, Vivid/Fashion Colors,
  Color Maintenance
- Each category: tips, step-by-step transition guides, inspiration photos,
  aftercare/maintenance advice
- Cross-link to what's already in the app — the UV protection note (6.6)
  and clarifying/color-care shampoos (8.2) are directly relevant to color
  maintenance and shouldn't be duplicated, just referenced
- Same low-complexity content-library pattern as 12.5

### 12.7 Suggested Build Order
1. **Foundation:** accounts + database + payment gate (Stripe is the
   default recommendation) — nothing else works without this
2. **Content-only features first:** 12.5 (Haircuts) and 12.6 (Color) —
   no new infrastructure beyond image hosting, can ship early
3. **Tracker + photos** (12.2) — now that accounts/DB/storage exist
4. **Where to Buy** (12.3) — start with the simple store-locator-link
   version, no live inventory
5. **Price Drop Notifications** (12.4) last — highest complexity, do the
   API/service research before writing any code for this one

### 12.8 Open Decisions
- [ ] Price point and model: $1.99 one-time, subscription, or free —
      undecided, keep configurable rather than hardcoded
- [ ] Free tier quiz-retake behavior: proposing "retake anytime, no saved
      history" for free vs. "saved history" for paid — confirm or adjust
- [ ] Payment processor — Stripe recommended as the default
- [ ] Price-tracking data source — needs research before committing to
      an approach

## 13. Open Items (fill in before/during build)
- [ ] Keep expanding Section 10 as more cruelty-free research comes in — it's
      intentionally a living list, not a final one
- [ ] Final app name
- [ ] Logo / wordmark
- [ ] Domain
- [ ] Final product list review (Crystal to confirm/expand picks above)
- [ ] Verify current cruelty-free certifications before launch
- [ ] v2 scope: see Section 12 for the full monetization + feature roadmap

---
**Instructions for Claude Code:** Build this as a Next.js + Tailwind app per
the stack, colors, screens, and flow above. Start with the landing page,
then the 10-question quiz component with progress bar (note Q6 is multi-select,
all others single-select), then the results page with the 3-way
Drugstore/Luxury/Cruelty-Free tab wired to the recommendation engine in sections
7–9 (concern-based defaults in 7, the fuller product library to draw from
in 8, and time-based routine depth in 9). Keep the recommendation data in
its own file (e.g. `lib/recommendations.js`) separate from UI components,
and keep the general principles (section 6) as reusable copy blocks that
can be referenced across multiple concern routines. Section 12 is v2 scope
(accounts, payments, tracker, and more) — don't build it as part of this
pass unless explicitly asked to; it needs its own planning session given
the jump in complexity from v1's no-backend design.
