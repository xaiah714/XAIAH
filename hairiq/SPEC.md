# Hair Care Routine App — Build Spec for Claude Code

> App name: TBD — leaning toward "How's My Hair," pending domain/
> availability confirmation (no existing app or trademark conflict found
> in research so far, but that's not the same as confirming the domain is
> free — check before committing). Using placeholder "HairIQ" throughout
> until then. Find/replace once confirmed.
>
> **Repo note (rev 6, July 12):** name CONFIRMED as **"How Is My Hair"** —
> renamed across all user-facing text (code identifiers unchanged). Owner
> is registering the domain directly. Also implemented in rev 6: palette
> v3 (owner-picked #ffb4d5 / #ff8d61 / #ff61a3 / #ffdb61), results split
> into Wash Day / Daily / At Night / Tips sub-tabs (kills the endless
> scroll), K18 recommended in every tab with its own step-by-step
> instructions expander (dry-hands + scrunch steps added), scalp-massage
> why/science, wavy two-option brushing, water-alone washing correction,
> Elvive Miracle Hair Serum (Elixir Ultime dupe) + Dove Bond Shield
> 10-in-1 night oils, satin (affordable) vs mulberry silk (luxury)
> pillowcase split with bonnet science, 2-in-1 shampoo-only correction
> (H&S Tea Tree), 🌐 Español machine-translation toggle, and a measured
> responsive audit (viewport meta, 375–1536px, 44px tap targets, no
> overflow) on both app and demo.
>
> Previous revision note: (July 12, second pass — switches to the
> saturated "groovy" palette per the §3 review, adds §6.10–6.17 education
> content (refined sweat rule, scalp-only shampooing, conditioner
> correction, wet-vs-dry brushing by type, towel technique, hard water,
> 2-in-1s, biotin honesty), and the §14 breakage/pre-poo explainer).
> Sections 1–12 are v1 and are implemented; Section 13 is the v2 roadmap
> and is intentionally NOT built — it needs its own planning session.
> Products the spec says not to guess (the cruelty-free boar-blend brush
> brand, the "sleek" spray, etc.) are NOT in the data — pending exact
> names from Crystal per §14.

## 1. What This App Does
A quiz-based tool that takes someone's hair type, scalp condition, and goals, then generates
a personalized hair-care routine with specific product recommendations across three lenses —
Affordable, Luxury, and Cruelty-Free — calculated regardless of quiz answer so the
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
> **Palette review (5 options considered):** leaning toward a more
> saturated pink-orange-yellow direction than the original soft pastel
> table below — "groovy/saturated/hippie fun" energy, not full pastel.
> Recommendation: keep the general warm coral-orange/pink/yellow spirit,
> but pull from a punchier reference palette (`#FFB74D` orange, `#FF6F91`
> pink, `#FFD54F` yellow, `#FFABAB` salmon, `#FCE4EC` light pink) rather
> than the softer pastel table currently below — same family of colors,
> more saturated and distinctive. Table below is the previous pastel
> version; treat it as superseded pending final confirmation.
> *(Implemented, then superseded by rev 6: the app now runs the owner's
> palette v3 — bg `#ffb4d5`, orange `#ff8d61`, pink `#ff61a3`, yellow
> `#ffdb61`, with `#c2410c` burnt orange for accent text so it stays
> readable. Any palette change is a token swap in `app/globals.css` +
> `scripts/demo-template.html`.)*

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
   3-way tab: **Affordable | Luxury | Cruelty-Free** (always live, all three
   are pre-calculated), "Retake Quiz" button, a locked "Save My Routine"
   button (see 13.1 — this replaces the old vague "Coming soon" copy with an
   explicit paywall: lock icon + "Unlock for $X" wording), and — at the very
   bottom of the screen — the free email signup (see Section 12, new)

## 5. Quiz Questions (11 — single-select unless noted, one per screen)
1. Hair type: Straight / Wavy / Curly / Coily
2. Hair density: Fine / Medium / Thick / **Not sure — new to this**
3. **Hair length** (new): Short (above shoulders) / Medium (shoulder to
   mid-back) / Long (mid-back to waist) / Extra long (past waist) — drives
   whether pre-shower oil treatment even applies, see 6.1 and 11.1
4. Scalp type: Oily / Dry & flaky / Sensitive or irritated / Balanced
5. **Main concern** (primary driver of results): Thinning or density loss /
   Dryness or damage / Frizz / Breakage & split ends / Dandruff or flaking /
   Slow growth / **New to curly or wavy — need a styling routine**
6. Main goal: Grow it longer / Increase density / Repair damage / Reduce
   frizz / Improve scalp health / Just maintain
7. Chemical treatments (**multi-select**): Salon color, no bleach / Bleached /
   Box dye at home, no bleach / Relaxed or permed / Keratin or smoothing
   treatment / None — **UI note (small, not loud):** color-depositing
   shampoo/conditioner (purple shampoo, toning products, etc.) does NOT
   count here — it just deposits pigment on the outside of the hair; it
   doesn't chemically alter the hair the way bleach/color/relaxers/keratin
   do. Real feedback: this was a genuine point of confusion when someone
   took the quiz, so a small clarifying line under the question (or an
   info tooltip) is worth adding.
8. Heat styling frequency: Daily / A few times a week / Rarely or never
9. Wash frequency: Daily / Every other day / Twice a week / Weekly or less
10. Time available for a routine: 5 min or less / 10–15 min / 20+ min
11. What matters most in product picks: Budget-friendly (affordable) / Luxury /
    Cruelty-free — (note: this only sets the *default* results tab; all
    three tiers are always calculated and viewable)

## 6. General Routine Principles (cross-cutting logic)

### 6.1 Pre-Wash Oil Treatment ("Pre-Poo") — recommend for most hair lengths
- Apply oil to mid-lengths and ends 10–20+ min before shampooing on wash day —
  reduces friction and breakage during washing. Everyone can benefit, though fine
  or low-porosity hair should use a lighter hand so it doesn't get weighed down.
- **Length matters here — see the new Q3 (hair length):** this step exists to
  protect ends from friction/dryness, so it barely applies to **short** hair
  (there's not much length of ends to treat) — skip or de-emphasize it for
  that answer. Show it normally for medium, long, and extra-long.
- **Why coconut oil specifically:** its fatty-acid structure lets it actually
  penetrate the hair shaft rather than just sitting on the surface — the
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
  after sweating — it only absorbs surface oil; it doesn't actually remove sweat,
  salt, or bacteria from the scalp.
- **Double-washing — say this explicitly in the app; most people skip it
  without realizing:** shampoo twice if scalp feels heavy with product,
  sweat, or buildup. **Important correction confirmed via research:** if
  the first wash is a clarifying shampoo, do NOT clarify twice — that
  squeaky-clean, stripped feeling means it's already worked. Follow it
  with a hydrating/moisturizing (non-clarifying) shampoo for the second
  wash instead. Clarifying breaks down buildup; the second, gentler wash
  actually cleanses without over-stripping. This is standard, well-
  supported practice, not a personal preference call.

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
  Treatment, followed by a lightweight hair oil. Crown Affair's Overnight
  Repair Serum (~$55) is another luxury night option some people compare
  to the Kérastase serum — real v1 feedback is that the comparison isn't
  a close match in practice, especially for bleached/heavily processed
  hair that needs more repair power, so list it as its own option rather
  than as an interchangeable dupe.
- Drugstore dupe: L'Oréal Paris Elvive Extraordinary Oil Midnight Serum —
  Abbey Yung's own content specifically calls this a dupe for the 8H Magic
  Night Serum, so the original claim here stands. Worth knowing: some other
  creators compare the same L'Oréal product to a *different* Kérastase
  product (Elixir Ultime) instead — both comparisons exist online, but
  since this project is following Abbey Yung's method specifically, her own
  stated comparison (8H Magic Night Serum) is the one to keep.
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
- **Reframe how this is presented — real v1 feedback:** don't word it as
  something you only put on right before going outside. A UV leave-in can
  just *replace* someone's regular leave-in for the whole summer instead —
  worn as an everyday product, not an occasional pre-outing step.
- Affordable pick: Pantene Sunkiss Glow (2026 launch), which targets UV,
  salt, and chlorine exposure specifically.
- Luxury picks (this tier was thin before — added two real options):
  JVN Complete UV Protection line (Leaping Bunny certified, also
  cruelty-free — cross-tag), and Bumble and bumble's UV Hair Protection
  collection (e.g., Hairdresser's Invisible Oil Primer, which combines UV
  filters with heat protection up to 450°F).

### 6.7 Chemical Processing Caution (box dye / bleach)
- At-home box dye contains metallic salts that can build up in hair and react
  unpredictably with future bleach or bond-repair services (sometimes causing
  gumminess or breakage). If Q7 flags box dye use, show a note recommending a
  clarifying/chelating shampoo before any future bleach or salon color, and
  mentioning the box dye history to a stylist.
- **Luxury pick for bleached hair specifically:** Pureology Strength Cure
  Blonde Shampoo/Conditioner — a violet-toning, repair-focused system
  (colloquially called "the blue one" though the formula itself is
  purple/violet-pigmented) made for exactly this case: toning brassiness
  while repairing lightened/bleached hair. Vegan formulation, though note
  Pureology is L'Oréal-owned so don't assume independent cruelty-free
  certification without checking — vegan and cruelty-free aren't the same
  claim here.

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

### 6.9 Air-Drying Isn't Automatically "Healthier" Than Blow-Drying
- There's a real, well-documented phenomenon called **hygral fatigue**:
  hair swells when wet and contracts as it dries, and repeated/prolonged
  swelling weakens the internal structure over time (damage to what's
  called the cell membrane complex, the "glue" holding the hair's layers
  together). This means leaving hair wet for a long stretch — especially
  sleeping with wet hair, or air-drying that drags on for hours — can
  cause more cumulative damage than a quick, protected blow-dry would.
  Medium/high porosity hair is more at risk than low porosity hair, since
  water gets in and out of the cuticle more easily.
- **Don't hardcode a specific minute threshold** — sources agree on the
  concept but not on one universal cutoff; frame the guidance as "avoid
  hours of wetness" (e.g., don't sleep on wet hair, don't let air-drying
  drag on indefinitely) rather than a precise number.
- Practical takeaway for the app: for people who air dry, a quick blow-dry
  with a diffuser and heat protectant is a reasonable alternative to
  hours of air-drying, not something to avoid on principle just because
  it's heat.
- **Technique tip worth including:** for oily-scalp types specifically, a
  partial blow-dry — pointing the dryer straight down at the roots/scalp
  only, not touching the length or ends — can speed up root drying time
  and help reduce how quickly the scalp gets oily again, without adding
  heat exposure to the ends at all.

### 6.10 Sweat Rule — Refined with Real Research
Real feedback asked to double-check the science here, and it added
nuance to the original blanket "wash after sweating" rule:
- **Cool-air scalp blow-drying is a legitimate touch-up technique**,
  acknowledged by dermatologists — but it only evaporates moisture, it
  does NOT remove salt, sweat, or bacteria. It's a reasonable stopgap
  between washes, not a wash replacement. Pair it with dry shampoo or a
  plain water rinse, not as a substitute for eventually washing.
- **For people who sweat/exercise daily:** most dermatologists don't
  recommend a full wash every single day even then — over-washing strips
  natural oils. Reasonable options for daily sweat: a plain water rinse
  at the scalp, a gentle sulfate-free shampoo (not a full clarifying
  wash), or a natural rinse alternative — a raw sugar scalp scrub rinse
  or a rosemary water rinse both work as gentler daily options. Save full
  shampoo washes (or clarifying washes specifically) for a few times a
  week rather than daily, even for daily sweaters.

### 6.11 Shampoo Is For the Scalp, Not the Ends
Real feedback flagged this as commonly misunderstood and worth stating
explicitly in the app:
- You only need to actually **wash the scalp** — that's where oil,
  sweat, and product buildup accumulate (there are no oil glands on the
  hair shaft itself). Shampoo lather rinsing through the length as you
  rinse is enough contact for the ends; you don't need to scrub shampoo
  into the ends on every wash.
- Exception: if ends feel grimy or product-heavy, an occasional (roughly
  monthly) full-length "reset" wash is fine — it's just not necessary
  every wash day the way scalp cleansing is.
- Wash frequency in general depends on the scalp, not the hair: wash when
  the scalp feels oily, sweaty, dirty, or itchy. If the scalp feels fine
  (balanced, normal, not itchy), there's no requirement to wash on a
  fixed schedule.

### 6.12 Conditioner — How to Apply, and Why It's Not Optional
Real feedback: someone in the family avoids conditioner entirely,
believing it causes breakage — this needs direct, clear correction in
the app, since the opposite is generally true (skipping conditioner
tends to increase breakage risk from tangling and dryness, not reduce
it). Cover this under the Conditioner section of results:
- **How to apply:** split hair into two sections (more if very thick),
  apply from mid-lengths to ends only — never on the scalp. It's normal
  and fine to need a generous amount, especially for thicker or textured
  hair.
- **Texture affects how much you need:** wavy, curly, and coily hair
  generally need more conditioner than straight hair, because the bends
  in the hair shaft mean the cuticle is more exposed along the curl
  pattern, so it absorbs (and needs) more moisture/product to stay
  smooth. This isn't overuse — it's the correct amount for that texture.
- **Distributing conditioner:** a wet detangling brush (11.2, 8.2) works
  well for curly/coily hair to spread conditioner through evenly while
  detangling in the same step.
- **What happens if you skip conditioner, by hair type** — worth adding
  under this section per hair type: hair becomes progressively harder to
  detangle, more prone to friction-based breakage, duller, and (for
  curly/coily specifically) loses definition and gets frizzier over time.
  This is true across hair types, not just textured hair, though textured
  hair shows it faster given how much more product it needs to begin with.

### 6.13 Brushing — Corrected by Hair Type (wet vs. dry)
Real feedback flagged the blanket claims here as too simple — checked
against actual sources, here's the accurate version:
- **Curly/coily hair: wet detangling only, never dry.** This is the one
  clear-cut rule — brushing curls dry causes significant frizz and
  breakage; always detangle wet, with conditioner in, using a wet
  detangling brush (11.2).
- **Wavy hair: can go either way.** Wet detangling works, done carefully
  (gentler than curly since waves are less fragile, but still more
  fragile than straight). Dry brushing is also fine for wavy hair
  specifically if someone *wants* a softer, less-defined wave look —
  dry brushing breaks up the wave clumps on purpose, which curly/coily
  hair doesn't want but some wavy-hair people do. If dry brushing, start
  from the ends and work up toward the roots.
- **Straight hair: doesn't need wet brushing as much, and dry is often
  easier.** Wet hair is more fragile for every hair type (not just
  curly), but straight hair doesn't tangle as much to begin with, so
  many experts actually recommend dry brushing for straight hair rather
  than wet — if brushing wet at all, use a wide-tooth comb, very gently.
  This corrects an earlier assumption that all hair types handle wet
  brushing equally well — they don't; it's a real tradeoff, not a
  universal green light.
- **General technique, all types:** always start brushing/detangling
  from the ends and work upward toward the roots — never start at the
  root and drag down through a full tangle, which is what actually tears
  hair out.

### 6.14 Towel Technique — Why It Matters
Real feedback asked for the "why" here, not just the tip:
- Regular terry-cloth bath towels have large, rough loops that snag the
  hair cuticle and create friction — that friction is what causes frizz
  and mechanical breakage when someone rubs hair dry with a normal towel.
- Microfiber towels and cotton t-shirts both have a smoother, tighter
  weave — less surface friction against the cuticle, so less frizz and
  breakage, while still absorbing water effectively (microfiber
  especially, since it's designed for high absorbency per surface area).
- Tie this to the existing "never sleep with wet hair" guidance (6.9,
  6.4) for anyone dealing with breakage specifically — the friction from
  a rough towel or from tossing and turning on wet hair compounds in the
  same way.

### 6.15 Hard Water & Filtered Showerheads
New content area, not previously covered:
- Hard water (high mineral content — calcium, magnesium) can leave a
  mineral film on hair over time that makes it feel dull, dry, and harder
  to lather or rinse clean. It's especially noticeable on bleached or
  chemically treated hair, where the already-compromised cuticle absorbs
  more of that mineral buildup and color can look duller or fade faster.
- A filtered showerhead is a reasonable, one-time fix rather than an
  ongoing product purchase — worth recommending, especially to anyone
  with bleached or color-treated hair, or anyone in a known hard-water
  region.
- Consider a simple "check if your area has hard water" prompt or note,
  since most people don't know their local water hardness off the top of
  their head.

### 6.16 2-in-1 Shampoo/Conditioners Aren't All Bad
Correcting an oversimplified "avoid 2-in-1s" instinct:
- 2-in-1s are only a problem if someone relies on them as their *only*
  conditioning step — they don't condition as thoroughly as a separate
  rinse-out conditioner, so replacing real conditioning with a 2-in-1
  long-term isn't ideal.
- Used occasionally (travel, quick washes, backup), they're fine. Some
  are genuinely good — Head & Shoulders 2-in-1 (already in the affordable
  library) and tea-tree-oil-based 2-in-1 formulas are both solid options
  worth naming specifically rather than writing off the whole category.

### 6.17 Biotin Supplements — Set Expectations Honestly
- Biotin supplementation only meaningfully helps hair/skin/nails if
  someone has an actual biotin deficiency — which is uncommon in people
  eating a reasonably varied diet. For non-deficient people, extra biotin
  generally doesn't do much; the research behind most biotin gummy
  marketing is weak for that population.
- Frame this factually, not as an accusation against any specific brand
  — the point is informing people, not shaming a category: if hair
  concerns persist despite a solid routine, the more useful move is
  bloodwork to check for an actual deficiency (ties directly to the
  existing bloodwork note under Thinning in Section 7) rather than
  guessing with supplements.

## 7. Recommendation Engine — Starter Content
Primary lookup key = answer to Q5 (Main Concern). Each concern lists a routine
plus three product lenses — Affordable, Luxury, and Cruelty-Free (this tab no
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
- Affordable: Mielle Rosemary Mint Scalp & Strengthening Oil; OGX Thick & Full
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
- Affordable: OGX Coconut Miracle Oil Mask; Aussie 3 Minute Miracle
- Luxury: Olaplex No.3 Hair Perfector
- Cruelty-Free: Briogeo Don't Despair, Repair! Mask; Innersense Hydrating
  Cream Conditioner

**Frizz**
- Routine: LOC/LCO method per 6.8; microfiber towel or t-shirt to dry (not
  rough terry); avoid touching hair once dry
- Affordable: OGX Anti-Frizz Argan Oil Serum; Not Your Mother's Frizz Go Away
- Luxury: Living Proof No Frizz Leave-In Conditioner
- Cruelty-Free: Rahua Frizz-Free Cream; Bread Beauty Supply Hair Oil

**Breakage / Split Ends**
- Routine: bond-repair treatment on wash days (K18 per 6.5); silk/satin
  pillowcase or nighttime bonnet per 6.4; only detangle wet hair with a
  wide-tooth comb; trim every 8–10 weeks
- Affordable: OGX Bond Repair Shampoo/Conditioner; L'Oréal EverPure Bond
  Strengthening line
- Luxury: K18 Leave-In Molecular Repair Mask
- Cruelty-Free: Olaplex No.4/No.5; K18 Leave-In Molecular Repair Mask (both
  brands are cruelty-free — Olaplex per brand claim, K18 independently
  certified — fine to show here even though they read "luxury-ish")

**Dandruff / Flaking Scalp**
- Routine: medicated shampoo 2x/week alternating with a gentle daily shampoo
  (see double-washing, 6.2); avoid hot water directly on scalp; scalp
  exfoliation 1x/week (scalp brush per 6.3)
- Affordable: Nizoral Anti-Dandruff Shampoo; Head & Shoulders (works well as
  one wash within a double-wash routine — it doesn't have to replace someone's
  whole shampoo/conditioner system, just swap it in for the second wash)
- Luxury: Christophe Robin Purifying Scalp Scrub
- Cruelty-Free: Briogeo Scalp Revival Charcoal + Coconut Oil Scrub; Derma E
  Scalp Relief Shampoo

**Slow Growth**
- Routine: 10-min nightly scalp massage with oil (6.3); growth serum on scalp;
  monthly protein treatment; regular trims to offset breakage
- Affordable: Mielle Rosemary Mint Oil; Maple Holistics Biotin Growth Serum
- Luxury: Act+Acre scalp treatments; Dr. Groot Hair Thickening Shampoo
  (correction — confirmed ~$30/bottle and sold at Sephora, so this is
  prestige-tier, not affordable, despite being Amazon-available too)
- Cruelty-Free: Vegamour GRO Serum

**New to Curly/Wavy — Styling Basics**
- Routine: sulfate-free shampoo or co-wash on wash days; LOC/LCO method per
  6.8 on soaking-wet hair; scrunch upward, plop with a microfiber towel or
  old t-shirt for 10–15 min; diffuse on low heat or air-dry; never brush dry
  hair — detangle only with fingers or a wide-tooth comb while conditioner
  is still in; refresh day 2–3 with water + a small amount of leave-in;
  loose "pineapple" pony at night per 6.4
- Affordable: Cantu Coconut Curling Cream; Aussie Miracle Curls Air Dry Cream
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
from for the Affordable and Luxury tiers across the app. Every product below
should end up in the product data somewhere; Section 7's picks are the
highlighted defaults, not the ceiling.

This follows the same four-phase structure as Section 6: Pre-Shower →
In-Shower → Post-Shower → Between-Wash. Steps marked *optional* can be
skipped entirely; core steps (shampoo, conditioning, leave-in) should
always be present in some form.

> **Which bond treatment do I actually need?** Bond treatments show up at
> three different points — pre-shower (8.1), in-shower (8.3), and
> post-shower (8.5) — and if the app just lists them one after another it
> reads like three separate mandatory steps. It isn't. **Pick one timing,
> not all three:**
> - **In-shower (8.3)** is the standard starting point for most people —
>   applied right after shampoo, before conditioner (e.g., K18).
> - **Pre-shower (8.1)** and **post-shower (8.5)** are alternatives to the
>   in-shower step, not additions on top of it. Use one of these instead if
>   a mid-shower step doesn't fit someone's routine, or as an occasional
>   extra boost layered on top for people who want more.
> This must be explicit in the UI wherever more than one bond-treatment
> option appears together (especially at the 20+ min "Full" depth from
> Section 9) — label it "pick one" rather than presenting them as a
> checklist. This was confusing in the v1 build; fix it there, not just in
> future spec content.

### 8.1 Pre-Shower (optional)
**Pre-shampoo bond repair treatment** (1–2x/week) — apply ≥10 min before
washing. Options: a dedicated pre-shampoo spray, or any of the bond-repair
products from 8.3 used before shampoo instead of after.

**Pre-shampoo oil treatment** (as needed) — see 6.1 for the coconut-oil
science and timing; this is where those products sit in the step order.

### 8.2 In-Shower — Shampoo
**Clarifying** (≥1x/week): L'Oréal EverPure Sulfate-Free, Garnier Fructis
Pure Clean, Dove Scalp+Hair Therapy Clarifying, Pantene Pro-V Volume & Body
(real v1 feedback: this one's a standout — cheap and lathers well, good
one to feature prominently in the affordable tier, not just list),
L'Oréal Metal Detox, Living Proof Clarifying Detox Shampoo, K18 Peptide Prep
Detox Shampoo, OUAI Detox Shampoo

**Non-clarifying / strengthening** (as often as needed): Garnier Fructis
Hair Filler + Vitamin Cg Shampoo, Not Your Mother's Tough Love Bonding
Shampoo, Dove Intensive Repair Shampoo, Dove Bond Strength Shampoo, L'Oréal
EverPure Bond Repair Shampoo, L'Oréal Elvive Dream Lengths Restoring
Shampoo (real v1 feedback: another standout affordable pick), Pureology
Strength Cure Shampoo, amika the kure Bond Repair Shampoo, Redken Acidic
Bonding Concentrate Shampoo

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
Conditioner, L'Oréal Elvive Dream Lengths Super Detangler Conditioner,
Pureology Strength Cure Conditioner, amika the kure Bond Repair
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
> **Gate this by Q8 (heat styling frequency)** — see 11.3 for the
> non-heat-user alternatives (L'Oréal No Haircut Cream, L'Oréal Purple
> 10-in-1, Crown Affair The Leave-In). Don't show heat-protectant-forward
> copy to someone who rarely/never uses heat.

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
Shampoo, Not Your Mother's Clean Freak Refreshing Dry Shampoo, K18 AirWash
Dry Shampoo (real product, confirmed — non-aerosol mist, biotech
odor-eliminating formula, very light application; also cruelty-free/vegan
per K18's existing certification, cross-tag into that tab too)

### 8.10 Affordable vs. Luxury Split (for tagging in the product data)
> **Renamed from "Drugstore" to "Affordable"** — correction on the
> original reasoning: Dr. Groot was cited as the example that prompted
> this rename, but that was wrong — Dr. Groot is confirmed ~$30/bottle
> and sold at Sephora, so it's actually Luxury tier (moved below), not an
> affordable online-only example. The rename itself still holds as a
> reasonable general practice (price point matters more than physical
> retail location for this category), but flag that the specific example
> used to justify it was mistaken — double-check pricing/retail placement
> before assuming a brand's tier based on where it's sold rather than
> what it costs.

- **Affordable:** Garnier Fructis, OGX, Dove, Pantene, TRESemmé, L'Oréal
  (Elvive/EverPure), Not Your Mother's, CeraVe, Neutrogena, Nizoral, Head &
  Shoulders, CER-100
- **Luxury:** K18, Living Proof, Redken, Pureology, amika, Oribe,
  Moroccanoil, Bumble and bumble, IGK, R+Co, epres, Dr. Groot (corrected —
  Sephora-sold, ~$30/bottle, prestige tier despite Korean-drugstore-style
  branding)
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
Use Q10 (time available) to decide how many steps from Section 8 show on the
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

**Already in Section 8's Affordable/Luxury library — cross-tag these too:**
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

## 11. Additional Personalization Signals

### 11.1 Hair Length (new — see Q3)
- Short (above shoulders), Medium (shoulder to mid-back), Long (mid-back to
  waist), Extra long (past waist)
- Primary effect: gates whether pre-shower oil treatment (6.1, 8.1) shows at
  all. Short hair doesn't have much length of ends to protect, so skip or
  de-emphasize that step for that answer — showing it anyway is the kind of
  irrelevant-recommendation problem that makes an app feel generic instead
  of actually personalized.
- Secondary effect worth considering later: nighttime protective styling
  (6.4) matters more the longer the hair is — a short cut has much less to
  protect from friction than extra-long hair does. Not a hard requirement
  for v1, but reasonable to de-emphasize for short hair the same way.

### 11.2 Recommended Brushes (tied to Q1 hair type AND Q2 hair density)
Brush choice isn't just hair type — density matters too, per actual brush
expertise: pure boar bristle is best for fine/normal hair, while a boar +
nylon blend works better for normal-to-thick hair (nylon alone for very
thick/coarse). Build this as a lookup on both Q1 and Q2, not Q1 alone:

- **Straight hair, fine/normal density:** pure boar bristle brush
- **Straight hair, thick density:** boar + nylon bristle blend (distributes
  oil like pure boar, but the nylon pins help with thicker strands)
- **Curly / wavy / coily hair (any density):** a wet detangling brush
  (flexible bristles designed for wet, tangled hair without snapping
  curls) stays the standard recommendation regardless of density

**Confirmed real products to use:**
- Mason Pearson — the original, iconic boar bristle brush (~$250), real
  and commonly referenced
- Crown Affair Mini Dual-Bristle Boar Hair Brush — luxury boar+nylon
  blend pick; Crown Affair's leave-in line is independently confirmed
  vegan and cruelty-free, reasonable to assume the brush line follows the
  same brand practice but confirm before stating that as fact
- For an affordable-tier option and any curly/wavy-specific brand names
  (a "wet detangling brush" style product, plus whatever the cruelty-free
  boar-bristle-blend brand was that got mentioned — transcription wasn't
  clear enough to pin down the exact name), get exact names from Crystal
  before finalizing rather than guessing

### 11.3 Leave-In & Heat Protectant — Gate by Actual Heat Use (Q8)
Real v1 feedback: recommending heat-protectant sprays to someone who
answered "rarely or never" on Q8 (heat styling frequency) doesn't make
sense — split this step into two paths instead of one generic list:

**For people who use heat (daily / a few times a week):** keep the
existing heat-protectant-forward picks — TRESemmé Protecting Heat Spray,
TRESemmé Keratin Smooth Blowout Heat Protect Spray, etc. (full list stays
in Section 8.6)

**For people who rarely/never use heat:** don't lead with "protectant"
framing at all — these should read as everyday moisturizing leave-ins,
not heat products:
- L'Oréal Elvive Dream Lengths No Haircut Cream — leave-in cream for
  long/damaged hair, reduces breakage and split ends (note: it does
  technically offer heat protection up to 450°F per the brand, but it's
  not positioned as a dedicated heat product, so it fits this list fine)
- L'Oréal Elvive Colour Protect Purple 10-in-1 Leave-In Spray — good pick
  specifically for color-treated/blonde hair, ties into the hair color
  section (13.6)
- Crown Affair The Leave-In Conditioner — confirmed vegan + cruelty-free,
  lightweight, works on wet or dry hair; good Luxury/Cruelty-Free tier
  pick for this list specifically because it's positioned as an everyday
  moisturizing leave-in rather than a heat product, even though it has a
  natural (meadowfoam oil) heat-protectant property as a bonus
- A specific new "sleek" spray was also mentioned but the name wasn't
  clear enough to confirm — check with Crystal for the exact product
  before adding it

## 12. Free Email Capture & Segmented Newsletter
This reverses the original v1 decision to skip email entirely (Section 1
said "skip email for now") — email capture is back in, but framed as a
free value-add, not tied to payment at all.

- **Placement:** bottom of the Results screen, below the Save/paywall
  button from 13.1 (next section) — visually separate from the paywall so
  it doesn't read as "pay to get emails"
- **Framing:** something like "Get new products, treatments, and deals sent
  to you" — not a signup wall, just an optional extra
- **Segmented by preference, not one-size-fits-all:** ask which tier(s)
  they want content about — Cruelty-Free, Luxury, Affordable (multi-select,
  can pick more than one). Someone who only cares about cruelty-free
  shouldn't get emails pushing affordable-only products they'd never buy —
  that's the fastest way to get someone to unsubscribe or never open the
  email again
- **Also capture ZIP/area code**, framed as "so we can point you to
  relevant options in your area" — this is about general regional
  relevance in email content, not a live store-inventory lookup (that's
  the separate, bigger "Where to Buy" feature in 13.3)
- **Implementation — self-contained, no third-party account needed to
  build this:** store signups directly in a database Claude Code sets up
  on the existing Vercel hosting (Vercel Postgres or similar) — a simple
  table of email, tier tags, ZIP, and timestamp. This avoids needing to
  create a Mailchimp/Klaviyo/ConvertKit account just to *capture* signups,
  and Claude Code can build and own this part entirely.
  > **One honest limit worth knowing:** capturing and storing emails is
  > fully automatable, but *actually sending* newsletter content to that
  > list later will still need some email-delivery service at that point
  > (e.g., Resend, Postmark, or one of the marketing tools). Setting up
  > that account requires domain/sender verification tied to a real
  > identity — that step can't be done by an AI on anyone's behalf, since
  > it requires a human to verify ownership. That's a separate, later
  > task from today's capture-and-store build, not a blocker for it.
- This is a free-tier, v1-appropriate feature — much lighter than the
  full accounts/payments lift the rest of Section 13 (v2) needs, since a
  signup form + one database table doesn't require user login

> **Owner note (July 11):** if they want all 3 included in their newsletter
> (cruelty-free, luxury, affordable), definitely have that as an option as
> well — make sure we can gather every prospect we possibly can grab for
> attention. (Implemented as the "All three ✨" chip in the signup form.)

## 13. v2 Roadmap — Monetization & Feature Expansion

**Heads up on scope:** v1 (already built) intentionally has no login, no
database, no backend — see Sections 1–2. Almost everything below requires
that foundation to exist first. This is a real step up in complexity from
v1, not a small add-on. Suggested phasing is at the bottom of this section
so Claude Code doesn't try to build all of it at once.

### 13.1 Tier Breakdown

> **Copy note:** never call the free tier a "trial" anywhere in the UI —
> it's not time-limited, it's a permanent free feature set. Word it as
> "free" / "included," not "trial."

> **"Save My Routine" button — make the paywall obvious, not vague:**
> real v1 feedback was that a disabled button just labeled "Coming soon"
> is confusing — it doesn't explain *why* it's disabled or what unlocks it.
> Replace it with an explicit paywall treatment: a lock icon plus
> "Unlock for $X" (or "$X/month" if it ends up being a subscription —
> keep the wording in the same config value as the price itself, since
> the copy needs to match whichever model gets picked). This is a
> low-lift v1 UI/copy change Claude Code can make now — it doesn't require
> the actual payment backend to exist yet, just the honest messaging.

**Free tier:**
- Take the quiz, get the personalized routine + recommendations across all
  three product tabs (this is everything v1 already does)
- Can retake the quiz anytime, but results aren't saved — each retake
  replaces the last one, no history (assumption — flagged as an open
  decision below, confirm or adjust)
- The free segmented email signup (Section 12) — not paid-tier, available
  to everyone regardless of purchase

**Paid tier** (price/model TBD — $1.99 one-time vs. subscription vs. free
is still undecided; don't hardcode a number, keep it in one config value):
1. Expanded product recommendations — more options per concern/tier, not
   just the 1–2 starter picks in Section 7
2. Unlimited quiz retakes **with saved history** — track how concerns
   change over time instead of overwriting the last result
3. Hair Care Tracker (see 13.2)
4. Where to Buy (see 13.3)
5. Price Drop Notifications (see 13.4)
6. Haircut Recommendations (see 13.5)
7. Hair Color Section (see 13.6)

### 13.2 Hair Care Tracker
- Daily/wash-day logging: which products were used, which steps from
  Sections 6–8 were done
- Non-wash-day logging: scalp massages, serums, night routine steps,
  anything else from the routine
- Custom goals/habits the user sets for themselves
- **Progress photos:** upload a photo, auto-timestamp it (no manual date
  entry), gallery view for side-by-side before/after comparison over time
- Needs: accounts, a database, and photo storage (e.g., S3 or Cloudinary)

### 13.3 Where to Buy
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

### 13.4 Price Drop Notifications
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

### 13.5 Haircut Recommendations
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
- Lower technical complexity than 13.2–13.4 — this is mostly a content
  library like Section 8, no new backend infrastructure needed beyond
  image hosting. Could realistically ship earlier/in parallel with other
  v2 work

### 13.6 Hair Color Section
- Categories: Going Blonde, Going Darker, Bleaching, Vivid/Fashion Colors,
  Color Maintenance
- Each category: tips, step-by-step transition guides, inspiration photos,
  aftercare/maintenance advice
- Cross-link to what's already in the app — the UV protection note (6.6)
  and clarifying/color-care shampoos (8.2) are directly relevant to color
  maintenance and shouldn't be duplicated, just referenced
- Same low-complexity content-library pattern as 13.5

### 13.7 Suggested Build Order
1. **Foundation:** accounts + database + payment gate (Stripe is the
   default recommendation) — nothing else works without this
2. **Content-only features first:** 13.5 (Haircuts) and 13.6 (Color) —
   no new infrastructure beyond image hosting, can ship early
3. **Tracker + photos** (13.2) — now that accounts/DB/storage exist
4. **Where to Buy** (13.3) — start with the simple store-locator-link
   version, no live inventory
5. **Price Drop Notifications** (13.4) last — highest complexity, do the
   API/service research before writing any code for this one

### 13.8 Open Decisions
- [ ] Price point and model: $1.99 one-time, subscription, or free —
      undecided, keep configurable rather than hardcoded
- [ ] Free tier quiz-retake behavior: proposing "retake anytime, no saved
      history" for free vs. "saved history" for paid — confirm or adjust
- [ ] Payment processor — Stripe recommended as the default
- [ ] Price-tracking data source — needs research before committing to
      an approach

## 14. Open Items (fill in before/during build)
- [x] Sanity-check the 5-min "Core" depth (Section 9) is realistic — real
      feedback wants it honestly just leave-in + minimal steps, not
      padded out to feel more substantial than 5 minutes actually allows
      *(verified in build: Core wash day is exactly shampoo + conditioner
      + leave-in, plus only the steps the chosen concern's §7 routine
      itself requires — no framework extras appear below Standard depth)*
- [x] For the Breakage concern specifically, add a line explaining *why*
      pre-poo helps (6.1) — reduces mechanical friction/breakage during
      washing — since that's the exact concern where the connection
      matters most and shouldn't be left implicit *(implemented)*
- [x] Confirmed: the L'Oréal EverPure Moisture 2-in-1 Spray is correctly
      categorized as a leave-in product (8.6), not a wash-in shampoo+
      conditioner — despite the "2-in-1" name, it's two benefits in one
      leave-in spray. No change needed, just flagging it was checked.
- [x] Final app name — **CONFIRMED: "How Is My Hair"** (renamed in all
      user-facing text; owner is registering the domain directly — RDAP
      findings below kept for reference)
      > **Domain check (RDAP, July 12, 2026):**
      > - `howsmyhair.com` — **taken**: registered Sept 2019 via Dynadot,
      >   currently a parking lander (no active business on it). Expires
      >   Sept 3, 2026 — could be bought from the owner or watched for a
      >   drop, but it is not free to register.
      > - `howsmyhair.net` and `howsmyhair.app` — **taken**.
      > - `howsmyhair.co` — **appears available** (no registration found).
      > - `howsmyhair.hair` — **appears available** (the .hair TLD exists
      >   and is on-brand).
      > Registration status can change any day and registrars may price
      > "premium" names higher — re-verify at the registrar at purchase
      > time. Trademark/app-store conflict research is a separate check.
- [ ] Keep expanding Section 10 as more cruelty-free research comes in — it's
      intentionally a living list, not a final one
- [ ] Logo / wordmark
- [ ] Domain
- [ ] Final product list review (Crystal to confirm/expand picks above)
- [ ] Verify current cruelty-free certifications before launch
- [ ] v2 scope: see Section 13 for the full monetization + feature roadmap
- [ ] Sections 11–12 are new: hair length quiz question + brush
      recommendations (11), and the free segmented email signup (12) —
      both are v1-appropriate (no accounts needed), unlike Section 13
- [ ] Confirm exact product names with Crystal: the cruelty-free
      boar-bristle-blend brush brand (name unclear from transcription),
      any additional wet-detangling-brush brand picks, the "sleek" leave-in
      spray mentioned as a new launch, and the exact serum product meant by
      "L'Oréal ... serum" under post-shower serums — don't guess these,
      confirm before adding to `lib/products.js`

---
**Instructions for Claude Code:** Build this as a Next.js + Tailwind app per
the stack, colors, screens, and flow above. Start with the landing page,
then the 11-question quiz component with progress bar (note Q7 is multi-select,
all others single-select), then the results page with the 3-way
Affordable/Luxury/Cruelty-Free tab wired to the recommendation engine in sections
7–9 (concern-based defaults in 7, the fuller product library to draw from
in 8, and time-based routine depth in 9). Keep the recommendation data in
its own file (e.g. `lib/recommendations.js`) separate from UI components,
and keep the general principles (section 6) as reusable copy blocks that
can be referenced across multiple concern routines. Sections 11 (hair
length + brushes) and 12 (email capture) are new and v1-appropriate — no
accounts/backend needed, just quiz logic and a signup form wired to a
third-party email service. Section 13 is v2 scope (accounts, payments,
tracker, and more) — don't build it as part of this pass unless explicitly
asked to; it needs its own planning session given the jump in complexity
from v1's no-backend design.
