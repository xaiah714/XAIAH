// ---------------------------------------------------------------------------
// Blueprint tab content (rev 18) — written from the owner's topic notes.
// Each builder takes the reader's quiz profile and returns sections, so the
// content leads with what applies to THEM. Image slots are placeholders
// until the owner's final photos are ready.
// ---------------------------------------------------------------------------

import { searchLink } from "./affiliates";

// Shoppable links for products named in the content. Amazon carries our
// Associates tag; every other retailer is ready for the network wrapper.
const buy = (...names) =>
  names.map((name) => ({
    label: name,
    url: searchLink({ brand: "", name }, "amazon"),
  }));

const textured = (p) => ["wavy", "curly", "coily"].includes(p.hairType);
const has = (arr, v) => Array.isArray(arr) && arr.includes(v);

// --------------------------------------------------------------- VOLUME ---
export function volumeSections(p) {
  const s = [];
  s.push({
    heading: "🎈 First: where does your volume actually stand?",
    body: [
      "Judge it honestly and naturally — wash your hair, let it air-dry with no product and no blow-dry, and look. Does it have volume? Yes, kind of, no, or really no?",
      "That baseline matters, because most “I have no volume” is not genetic. It's one of the causes below, and those are fixable.",
    ],
  });
  s.push({
    heading: "🔍 The real causes of flat hair",
    items: [
      {
        label: "Not washing enough — or not washing well",
        text: "The most common cause by far. Volume starts at a clean scalp; oil at the root weighs hair down before it has a chance to lift. Not washing *well* counts too — a quick rinse that never really cleans the scalp leaves the same film behind.",
      },
      {
        label: "Too much heavy product sitting on top",
        text: "Creams, oils and leave-ins applied at the roots (or just used too generously) flatten hair the moment it dries. Keep the heavy stuff mid-lengths to ends.",
      },
      {
        label: "Air-drying versus blow-drying",
        text: "Air-drying lets hair dry flat against your head — gravity wins. Even a partial blow-dry at the roots changes the shape it dries into.",
      },
      {
        label: "Sweat and oil buildup",
        text: "Really the same root cause as not washing: sweat and sebum accumulate, the roots get weighed down, and no styling fixes it until you wash.",
      },
      {
        label: "Length itself",
        text: "The longer your hair gets, the heavier it gets, and the more your own length drags the roots flat. If you don't want to lose length, layers are the trade you make instead.",
      },
    ],
  });
  s.push({
    heading: "🛠️ Tools that actually create volume",
    body: [
      "Volumizing clips at the roots while hair dries, and volume-drying attachments — both work whether you're blow-drying or air-drying, and both work with a diffuser.",
      "Clip the roots damp, let hair dry, remove the clips: you get lift built into the dry shape instead of trying to add it afterwards.",
    ],
    images: [{ caption: "Root clips placed for volume" }, { caption: "Diffusing for volume" }],
    links: buy("volumizing root clips", "hair diffuser attachment"),
  });
  s.push({
    heading: "⚡ Quick volume, right now",
    body: [
      "Before a photo or when you need instant fullness: flip your head upside down and shake your hair back and forth like a rockstar, then flip back up. Costs nothing, takes three seconds, works on every hair type.",
    ],
  });
  s.push({
    heading: "💬 The honest part",
    body: [
      "If you genuinely struggle with volume — fine density, straight texture, or both — there is a ceiling to what you can do without styling. Heat styling, blowouts and root lift products exist because of that ceiling, and choosing not to use them is completely valid. Just know the difference between “my routine is wrong” and “this is my hair, and it needs styling to do that.”",
      p.density === "fine"
        ? "Your quiz says fine density, so you're squarely in this group — the causes above are still worth fixing first, but a blunt or U-shaped cut will do more for apparent fullness than any product."
        : "",
      "Different hair types do struggle differently: very straight and very fine hair has the least natural lift, and some hair (including many people's naturally very straight, smooth hair) simply resists volume no matter the routine.",
    ].filter(Boolean),
  });
  return s;
}

// -------------------------------------------------------------- COLORED ---
// (Bleached lives here too — one colour tab, per the notes.)
export function coloredSections(p) {
  const s = [];
  s.push({
    heading: "🎨 Start here: what are you actually doing?",
    body: [
      "Colour splits into three journeys, and the care is different for each: **going lighter** (blonde, lightening, bleach), **going darker**, and **maintaining** what you have. Find yours below.",
      p.bleached
        ? "**Your quiz says bleached** — the lightening section below is your home base, and the maintenance rules there are not optional for you."
        : p.colorTreated
          ? "**Your quiz says colour-treated** — the maintenance section is the one to bookmark."
          : "",
    ].filter(Boolean),
  });

  s.push({
    heading: "☀️ Going lighter — blonde, lightening, bleach",
    items: [
      {
        label: "Know your starting point",
        text: "What's your base colour, and how far are you going — a little lighter, or a lot? Going from a natural level 5 to almost a 9 is a huge jump. It can absolutely be done, but if the health of your hair matters to you, it should be done across multiple sessions rather than forced in one.",
      },
      {
        label: "Ask for a test strand",
        text: "Especially if it's your first time bleaching. A strand test shows how your hair actually lifts and how it holds up — before you commit your whole head to it.",
      },
      {
        label: "Bleaching techniques differ",
        text: "Foils, balayage, weaving, teasylights — they place lightener differently and grow out differently. There's real value in staying with one stylist: mine wove the bleach and, over years of going to her, she built a consistent pattern that always blended with what came before.",
      },
    ],
    images: [{ caption: "Bleach placement techniques" }],
  });

  s.push({
    heading: "🧴 Bleached-hair rules (non-negotiables)",
    items: [
      { label: "Pre-wash oil, always", text: "A pre-poo oil (OGX is the easy one) before every single wash. After bleaching this stops being optional — it's the cushion that keeps fragile hair from snapping during the wash." },
      { label: "Heat protectant, always", text: "Every hot tool, every time. Bleached hair has no margin left." },
      { label: "Sulfate-free, mostly", text: "Sulfate-free products day to day, with the occasional sulfate wash when you genuinely need a deeper clean." },
      { label: "Bond treatments as a fixture", text: "Not a treat — a regular part of the routine. Bleached hair is high-porosity: it drinks moisture in and loses it just as fast, which is also why your layering order is LCO (cream before oil)." },
      { label: "Purple shampoo vs. purple conditioner vs. gloss", text: "Purple shampoo tones brass while it cleanses (easy to overdo — it can go dull or lilac). Purple conditioner tones more gently with less risk. A gloss is the strongest and most even option and lasts longest, but it's a bigger commitment. Start gentle and work up." },
    ],
  });

  s.push({
    heading: "🌑 Going darker",
    items: [
      { label: "Where are you starting?", text: "Natural blonde and bleached blonde behave completely differently. Bleached hair is porous and will grab dark colour unevenly unless it's prepped." },
      { label: "Colour fill first", text: "Going from bleached blonde to a dark colour usually needs a filler — the warm pigment that bleach removed gets put back first, then the dark colour goes on top. Skip it and you get muddy, greenish or patchy results that fade fast." },
      { label: "Semi-permanent vs. permanent", text: "Semi-permanent is the lower-commitment way in: it fades gradually rather than leaving a hard line, and it's gentler on already-processed hair. Permanent lasts but locks you in." },
      { label: "It may look fake at first", text: "Depending on your hair's health, freshly darkened bleached hair can look flat or wig-like for the first week or two. It settles as it fades slightly and your natural shine returns." },
      { label: "Slow transition or all at once?", text: "You can go darker gradually over several salon visits, or do it in one. All at once can be visually shocking — but it's better for your hair, because it ends the bleaching entirely. Expect to revisit once more if the dark fades; colour-depositing masks bridge the gap between visits." },
    ],
  });

  s.push({
    heading: "💜 Colour-depositing shampoo vs. conditioner vs. mask",
    body: [
      "All three refresh faded colour between salon visits. They are not interchangeable — here's how to pick.",
      "**One trick worth knowing:** even though masks say to use them like a conditioner, you get far more colour out of a mask by applying it BEFORE shampooing, on dry or dampened hair. Use a spray bottle to dampen, then apply section by section with gloves, combing it through (or using a wet-hair brush) so the deposit is even. Leave it 30 minutes, an hour, or a few hours — the longer it sits, the more colour deposits, and the longer you can go before touching up.",
    ],
    items: [
      {
        label: "Colour-depositing shampoo — lowest effort",
        text: "**Pros:** you're already washing your hair, so it costs no extra time, and it's very hard to over-deposit. **Cons:** the least pigment — it's rinsed off too quickly to do much. **Best for:** tiny refreshes and colour that's still fairly fresh. **How often:** every wash, or every other wash, depending on how fast yours fades.",
      },
      {
        label: "Colour-depositing conditioner — the sweet spot",
        text: "**Pros:** deposits noticeably more than shampoo, moisturizes while it colours, and it's gentle enough to use often because it isn't cleansing. **Best for:** most people — it's the balance point between pigment, conditioning, upkeep and cost. **How often:** every one to two weeks.",
      },
      {
        label: "Colour-depositing mask — most pigment",
        text: "**Pros:** the strongest deposit, deep-conditions like a hair mask, and reliably revives faded colour — closest thing to a mini salon service at home. **Cons:** easy to over-deposit if you leave it too long, and usually the most expensive. **Best for:** very faded colour, vivids (pink, blue, etc.) needing a real refresh, or anyone who wants maximum pigment and would rather do it less often. **How often:** every 3–5 weeks.",
      },
    ],
    images: [{ caption: "Colour-depositing products compared" }],
    links: buy("color depositing conditioner", "color depositing hair mask", "purple shampoo", "purple conditioner"),
  });
  return s;
}

// ---------------------------------------------------------------- NIGHT ---
export function nightSections(p) {
  const s = [];
  const scalpList = p.scalp || [];
  s.push({
    heading: "🌙 Your night routine, by what's actually bothering you",
    body: ["Night care isn't one routine — it depends on your concern. Find yours:"],
    items: [
      {
        label: "Dryness",
        text: "A serum first, then an oil on top to seal it in. Detangle before bed if your hair type calls for it, then a protective style: a low ponytail (skip it if your hair is very long), a braid, or a pineapple for wavy and curly hair.",
      },
      {
        label: "Greasiness",
        text: "Don't add product on top — you'd be feeding the problem, and that greasiness is often product buildup in the first place. Do a protective style, then wash the next day. Be honest about how much product you use and where. **Mids and ends only need a real wash about once a month** to reset buildup; the rest of the time, the shampoo rinsing down from your scalp is enough to clean them. When you do wash mids to ends, squeeze or pat the shampoo down the length — or gently press it between your palms like a praying motion. Never scrub hard: that's mechanical breakage.",
      },
      {
        label: "Keeping curls defined overnight",
        text: "Use your usual serum and oil, then a pineapple ponytail on top of your head (a half-pineapple works if your hair is shorter, or if you just prefer it). Don't tie it tight — tight causes scalp strain and a dent from the scrunchie. A loose bun at the crown works too. In the morning: take it down, shake at the roots with your fingertips, flip your hair, and if you need more, a wide-tooth comb lightly through keeps definition and volume.",
      },
      {
        label: "Damaged or split ends",
        text: "Honest answer: there is no night fix. Splits can't be repaired — they can only be cut. What you *can* do overnight is protect what's there: keep it hydrated with a serum and oil and reduce friction. But eventually those ends have to come off.",
      },
    ],
  });

  s.push({
    heading: "🛡️ Protection — what to sleep on and in",
    body: [
      "Satin or silk bonnets, pillowcases, and head wraps/scarves are the whole category. They cut the friction that causes breakage and frizz while you move in your sleep.",
      "**Long-hair tip:** there are extra-long satin/silk bonnets made to run down your back. They're excellent for very long hair, for preserving a keratin treatment, Brazilian blowout or any smoothed style, and for anyone who'd rather sleep with hair down than tied up.",
      "**Satin/silk scrunchies are the unsung hero** — worth having a stack. Kitsch makes good ones.",
    ],
    images: [{ caption: "Bonnet, pillowcase and scrunchie options" }],
    links: buy("silk bonnet", "long satin bonnet for long hair", "silk pillowcase", "Kitsch satin scrunchies"),
  });

  s.push({
    heading: "💇‍♀️ Overnight hairstyles",
    items: [
      { label: "Braids", text: "Single, double, Dutch, French — all protective, all reduce tangling. Keep them loose." },
      { label: "Twists", text: "The two-strand alternative to a French or Dutch braid. Faster, and gentler on the scalp." },
      { label: "Pineapple", text: "Loose, high ponytail at the very top of your head. The best protection for curly and wavy patterns, and it doubles as volume in the morning." },
      { label: "Heatless curls", text: "Rods, ribbons or a robe belt. Thinner sections = tighter curls; thicker sections = looser curls and waves." },
      { label: "Overnight heatless blowout rods", text: "For a blowout look without heat. **Satin versions** leave hair softer and shinier, but some people find hair slips out and won't hold. **Velcro versions** grip much better but give less shine. Pick based on your hair type and what you're after." },
    ],
    images: [{ caption: "Overnight styles — braids, pineapple, heatless curls" }],
    links: buy("heatless curling rod set", "satin overnight blowout rollers", "velcro overnight rollers"),
  });

  s.push({
    heading: "🧴 Scalp care at night",
    items: [
      {
        label: "A nightly scalp serum",
        text: "Worth having in the routine. **One warning:** The Ordinary's density serum is far too greasy for daily use — use that one only at night, on wash days, on a clean scalp.",
      },
      {
        label: "Brush your scalp",
        text: "Three minutes minimum, ten minutes a day ideally, with a wooden or bamboo brush. It's for blood flow and circulation to the follicles.",
      },
      {
        label: "Itchy scalp? Ask an honest question",
        text: "Are you leaving your scalp dirty too long before washing? A dirty scalp gives bacteria room to grow, and that's where most scalp problems begin.",
      },
      {
        label: "Dandruff",
        text: "Often comes from washing too infrequently. Use a dandruff shampoo either for both washes, or as the second wash only if it feels intense.",
      },
    ],
  });
  if (scalpList.includes("oily") || scalpList.includes("flaky")) {
    s[s.length - 1].body = [
      "Your quiz flagged scalp concerns, so this section matters more for you than most:",
    ];
  }
  return s;
}

// ------------------------------------------------------------- SWIMMING ---
export function swimmingSections(p) {
  return [
    {
      heading: "🏊‍♀️ Before you get in the water",
      body: [
        "The goal is simple: fill your hair up before the pool or ocean can. Hair absorbs whatever it touches first, so if it's already saturated with fresh water and lightly oiled, it has far less room to soak up chlorine or salt.",
      ],
      items: [
        {
          label: "1. Wet your hair with fresh water first",
          text: "Do this at the shower before you get in. It's the single highest-value step and it costs nothing.",
        },
        {
          label: "2. Add a little oil",
          text: "Any oil that works for your hair — this is the one place where coconut oil's ability to penetrate the shaft isn't the point, because you're building a barrier against chlorinated water, not conditioning. If your usual OGX pre-poo feels too heavy to rinse out afterwards, use something lighter. A leave-in works too but is heavier and adds more buildup to the pool, so oil is the cleaner choice.",
        },
        {
          label: "3. Detangle before you swim",
          text: "Chlorinated water makes hair feel brittle and tangle much more easily. Going in already detangled saves you a fight later.",
        },
        {
          label: "4. Swim cap",
          text: "If you want your hair as healthy as possible — and especially if you swim often — this is the one that actually changes outcomes.",
        },
      ],
      images: [{ caption: "Pre-swim routine steps" }],
    },
    {
      heading: "🌊 Salt vs. chlorine vs. fresh water — they damage differently",
      items: [
        {
          label: "Chlorine (pools)",
          text: "Chlorine is a disinfectant that strips the natural oil layer off the hair shaft and can bind to the hair, leaving it dry, rough and brittle. On lightened hair it also reacts with copper in the water — that's the real cause of the green tint people blame on chlorine itself. Repeated exposure without protection is genuinely cumulative damage.",
        },
        {
          label: "Salt water (ocean)",
          text: "Salt is dehydrating by nature: it draws moisture out of the hair shaft through osmosis, leaving it rough, tangly and matte. It also swells and roughens the cuticle, which is why beach hair feels textured and looks fuller — that texture is cuticle damage doing a nice impression of volume.",
        },
        {
          label: "Fresh water (lakes, rivers, plain pool-free swimming)",
          text: "Gentler, but not neutral. Hair swells when wet and contracts as it dries, and hours of being saturated weakens its internal structure — hygral fatigue. Fresh water in lakes and rivers can also carry heavy minerals that behave like hard water.",
        },
        {
          label: "Hard water",
          text: "Calcium and magnesium leave a mineral film that builds up over time, making hair dull, dry and hard to lather. Colour-treated hair absorbs it fastest, which dulls and fades colour sooner.",
        },
      ],
    },
    {
      heading: "🚿 After swimming — in the shower",
      body: [
        "**Use a chelating shampoo.** This is the part most people get wrong. A clarifying shampoo is a strong cleanser that strips surface buildup like oil and product. A **chelating** shampoo goes further — it chemically binds and lifts hard-water minerals, chlorine and heavy metals from *inside* the hair shaft. For swimmers, that difference is everything.",
      ],
      items: [
        {
          label: "Heavy swimmer — about once a week",
          text: "If you swim in chlorine, at the beach, or in mineral-heavy lakes and rivers, once a week is right. These shampoos are much stronger than regular or even clarifying ones, so on other days use a regular, moisturizing or sulfate-free shampoo for a gentler wash.",
        },
        { label: "Occasional swimmer — every 2 to 4 weeks", text: "Enough to keep buildup from accumulating without over-stripping." },
        { label: "Barely swim — only when needed", text: "Reach for it if your hair ever feels dull or stops responding to conditioner. That's the buildup signal." },
        {
          label: "Always condition afterwards",
          text: "Leave it on longer than usual, and use a hair mask instead if your hair feels especially dry from the chlorine or salt.",
        },
      ],
    },
    {
      heading: "☀️ After the shower — and the sun problem nobody talks about",
      body: [
        "Apply your normal products. Then, if you're a heavy swimmer or spending a lot of time outdoors, add **a UV-protecting leave-in spray**. If you already love your current leave-in, don't replace it — just add the UV spray to the top and crown, which take the most direct sun.",
        "**On very hot days:** if it's hot enough that you're sweating while your hair air-dries, that sweat is sitting on your scalp the whole time. A quick blow-dry at the scalp, letting the rest air-dry, is often the better call — it also avoids hours of hygral fatigue in summer.",
        "**The sun does more than people realize.** Someone with perfectly virgin, undamaged hair can get so much sun damage that it looks like they bleached it or spent years abusing it — UV breaks down the hair's protein and pigment the same way it damages skin. As UV levels get stronger in many regions, this matters more each year. It affects curly and wavy hair too, sometimes badly enough to lose curl definition and pattern entirely. It's real damage and almost nobody accounts for it.",
      ],
      images: [{ caption: "UV damage comparison" }],
      links: buy("UV protection leave in spray hair", "chelating shampoo swimmers"),
    },
    {
      heading: "🥽 Best swim cap",
      body: [
        "**SOUL CAP — large swimming cap for long hair.** Designed for long hair, dreadlocks, weaves, extensions, braids, curls and Afros, in silicone, available on Amazon.",
        "Why this one: most caps stop at large, and a too-snug cap causes serious mechanical breakage every time you pull it on and off — plus it's near-impossible to fit a braid inside. SOUL CAP goes up to XXL, so there's genuinely a size for everyone. If you have thick hair, braids, locs or an Afro, size up. For long straight or wavy hair, medium works well and large is comfortable. It's the rare cap that works for adults of any hair type, men and women.",
      ],
      images: [{ caption: "Swim cap sizing guide" }],
    links: buy("SOUL CAP large swim cap long hair"),
    },
  ];
}

// -------------------------------------------------------------- BRUSHED ---
export function brushedSections(p) {
  const s = [];
  s.push({
    heading: "🪮 How to actually brush your hair",
    body: [
      "Most people brush wrong: they start at the top and rip straight through tangles, and they never section. Doing it properly is the difference between losing hair every day and keeping it. This method works on wet or dry hair, and on every hair type — including curly hair on the occasions you do brush it (before a pre-poo or a mask, for instance).",
    ],
    items: [
      {
        label: "1. Section it",
        text: "Split your hair down the middle and bring both halves in front of your shoulders. Then take one half and, using your index finger, draw a line from the top of your ear to the back of your head — that splits it into a top and bottom section. Clip the top away and start with the bottom.",
      },
      {
        label: "2. Start at the very ends",
        text: "Brush the last few inches first, then work upward. **When you hit a tangle, do not go above it and brush down** — that just drags more hair into the knot and makes it worse. Hold the hair just above the tangle with your other hand and brush through the tangle itself. Holding it takes all the pull off your scalp.",
      },
      {
        label: "3. Finish the section, then do the top",
        text: "Once the bottom section glides, move it behind your shoulder or clip it away, drop the top section down, and repeat exactly the same bottom-to-top process.",
      },
      {
        label: "4. Put the halves back together",
        text: "Unclip everything on that side and brush the whole half through. It should glide, because both sections are already detangled.",
      },
      {
        label: "5. Repeat on the other side",
        text: "That's one head, detangled with the least mechanical breakage possible. It sounds slow — it takes a couple of minutes, and it adds up enormously over months.",
      },
    ],
    images: [{ caption: "Sectioning diagram — the ear-to-back-of-head line" }],
  });

  s.push({
    heading: "🖌️ Picking a brush",
    links: buy("UNbrush detangling brush", "Wet Brush vented detangler", "Tangle Teezer"),
    body: [
      "Find a detangling brush that works for *your* hair — this is personal. For wavy hair, the UNbrush is the standout (it handles wet and dry equally well). The Wet Brush with vents and the Tangle Teezer are both solid, well-liked options too.",
      "**Angle your section line however suits you.** Some people angle it higher than a straight ear-to-back line — that's worth doing if one half of your hair is harder to detangle than the other (past bleach damage, for example, often makes the bottom half easier and the top half fussier).",
    ],
  });

  if (p.hairType === "wavy" || !p.hasQuiz) {
    s.push({
      heading: "🌊 Wavy hair gets choices",
      body: [
        "Wavy hair does **not** have to be brushed only when wet — that rule belongs to curly hair. Waves get options, and each one gives a different result:",
      ],
      items: [
        { label: "Brush damp, after the shower", text: "Distributes your products evenly through the hair. Many wavies do only this." },
        { label: "Brush dry", text: "Gives soft, fluffy, voluminous waves — genuinely beautiful, and the best route if you struggle with fullness or density." },
        { label: "Don't brush wet at all", text: "Completely valid, and common among people going for a straighter look." },
        { label: "Detangle dry on purpose", text: "Some people detangle dry specifically to avoid mechanical breakage, since wet hair is more fragile for every hair type." },
      ],
      footer:
        "You can even rotate: definition one wash, volume the next, straight the one after (skip the scrunching and treat it like straight hair after the shower). Waves are the most flexible texture there is.",
    });
  }

  if (["curly", "coily"].includes(p.hairType)) {
    s.push({
      heading: "➰ Curly and coily hair — brush wet, with slip",
      body: [
        "Brush on soaking-wet hair with conditioner in it. That combination gives enough slip that the brush passes through instead of snapping curls, and it detangles and distributes conditioner in the same pass.",
        "Use a wet detangling brush with flexible bristles, or your fingers, or a wide-tooth comb — and always work from the ends upward, section by section, exactly as above. Never brush this texture dry: it breaks the curl clumps, creates frizz, and causes real breakage.",
        "Coily hair especially: work in small sections and be patient. Rushing is what causes damage, not the brush itself.",
      ],
    });
  }

  s.push({
    heading: "💧 If your hair is very dry or brittle",
    body: [
      "If brushing feels like it might break your hair but you need to do it anyway, add a hair oil first. It coats the strand and gives just enough slip for the brush to pass through instead of catching.",
    ],
  });
  return s;
}

// ---------------------------------------------------------- DAMAGE-FREE ---
export function damageFreeSections(p) {
  return [
    {
      heading: "🚫 Styles to avoid",
      body: [
        "The common thread in all of these is **tension on the scalp**. Constant pulling at the follicle causes traction alopecia — hair loss along the hairline and part that can become permanent if it goes on long enough. It's one of the few kinds of hair loss that is entirely preventable.",
      ],
      items: [
        { label: "Slicked-back styles", text: "Anything using water, gel and a boar or vegan bristle brush to force hair flat and tight. The tighter the slick, the more tension sits directly on your hairline." },
        { label: "Tight ponytails", text: "Especially high, tight ones worn daily. If you can feel it pulling, it's pulling on the follicle too." },
        { label: "Braids that are too tight", text: "Braids are protective in principle — but a braid installed too tightly is one of the most common causes of hairline damage. Tension at the root cancels out any protection along the length." },
        { label: "Any style that hurts", text: "The simplest rule there is. Discomfort, tenderness, or little bumps along the hairline all mean it's too tight. Take it down." },
      ],
      images: [{ caption: "Styles to avoid — examples" }],
    },
    {
      heading: "✅ Styles to wear instead",
      items: [
        { label: "Loose braids", text: "All the protection, none of the tension. Leave enough give to slide a finger under the braid at your scalp." },
        { label: "Mid to low ponytails", text: "Lower placement means dramatically less pull on the hairline than a high pony." },
        { label: "Claw clips", text: "The best friend of damage-free styling — they hold without pulling. Great for curly and wavy hair especially." },
        { label: "Half-up, half-down with a claw clip", text: "Keeps hair off your face with almost no tension anywhere." },
        { label: "Banana clips", text: "Curly and wavy friendly, and they distribute hold across a wide area instead of one tight point." },
        { label: "Twists", text: "Gentler than braids to install, and just as protective." },
        { label: "Low space buns", text: "Cute, and the low placement keeps the tension off your hairline." },
      ],
      images: [{ caption: "Damage-free styles — examples" }],
      links: buy("large claw clips hair", "banana clip hair", "satin scrunchies"),
      footer:
        "The test for any style: it should feel secure, never tight. If your scalp is sore or you can see the skin pulling at the roots, redo it looser.",
    },
  ];
}
