// ---------------------------------------------------------------------------
// How Is My Haircut — the cut decision tree (rev 15).
//
// The logic mirrors how a good stylist actually thinks:
//   hair type  →  cut METHOD (dry curl-by-curl vs classic wet cut)
//   your goal  →  cut SHAPE (blunt / U / V / layers / face-framing…)
//   your face  →  LENGTH (a guideline, never a rule)
//
// buildHaircutSections(profile) returns the personalized branch first,
// then the full reference so anyone can explore the whole tree.
// ---------------------------------------------------------------------------

// --- the shapes, in plain language ----------------------------------------
export const CUT_SHAPES = [
  {
    id: "blunt",
    label: "Blunt (one length)",
    text: "Every strand ends at the same sharp line. Nothing is removed from the perimeter, so your ends look as thick as they possibly can — this is the #1 cut for density. Trade-off: zero built-in movement, and on very thick or curly hair it can go triangular.",
  },
  {
    id: "u-shape",
    label: "U-shape — soft, rounded, thick ends",
    text: "A soft rounded shape that keeps the ends thick. It's the density-keeper's cut: you can wear it with layers, with no layers, or with face-framing layers only, and the ends stay full either way. If you want thickness without the flat board edge of a blunt cut, this is it.",
  },
  {
    id: "v-shape",
    label: "V-shape — tapers to a point",
    text: "Tapers to a sharp point down the back, usually with heavy layers. Genuinely great on really thick hair and on thick curly hair, where the taper removes weight that would otherwise puff out. But on finer hair it can make you look like you have far less hair than you do — the point reads as thin ends.",
  },
  {
    id: "blend",
    label: "Blend cut / thinning shears",
    text: "Not a shape — a technique. Thinning shears break up the ends so they blend instead of stopping at a sharp line, which adds texture and softness. The catch: it also removes bulk from your ends. On thick hair it's a relief; on fine hair it's how you end up with wispy, see-through tips. Blunt keeps thickness and a sharp line; blending gives texture and no line.",
  },
  {
    id: "face-framing",
    label: "Face-framing layers only",
    text: "Shorter pieces around the face, perimeter untouched. This is the answer to “I want volume AND thickness” — you get lift and shape where people look, while the ends stay as dense as a blunt cut.",
  },
  {
    id: "long-layers",
    label: "Long layers",
    text: "Gentle graduation through the lengths for body and movement. Ask for the shortest layer to sit at or below the collarbone — that keeps volume up top without thinning the ends. Too many layers is the most common cause of “my hair looks stringy at the bottom.”",
  },
  {
    id: "internal",
    label: "Internal / invisible layers",
    text: "Weight removed from inside the hair, perimeter left alone. Nobody can see the layers — they just see hair that moves and isn't heavy. Ideal for thick hair that feels like a helmet but shouldn't look thinner.",
  },
  {
    id: "curtain",
    label: "Curtain bangs",
    text: "Face-framing that starts around the brow or cheekbone and sweeps open. Softest possible fringe, grows out gracefully, and instantly adds the look of fullness around the face.",
  },
  {
    id: "shag",
    label: "Shag / wolf cut",
    text: "Heavy layering plus a fringe — maximum texture and volume. Genuinely fun on wavy and curly hair, but it trades away perimeter density: your ends will look lighter, by design.",
  },
  {
    id: "butterfly",
    label: "Butterfly cut",
    text: "Short face-framing layers over long underneath layers. Looks like a big chop from the front while keeping your length in back. A low-risk way to test “shorter” without cutting length off.",
  },
  {
    id: "bob-lob",
    label: "Bob / lob",
    text: "Blunt at chin (bob) or shoulder (lob). Because all the density stacks into a shorter perimeter, this is the fastest way to make fine hair look genuinely thick.",
  },
  {
    id: "tapered",
    label: "Tapered / shaped cut",
    text: "Gradually shorter at the sides and nape with length kept on top. Creates a defined silhouette on coily and tightly curled hair without sacrificing density where it shows most.",
  },
  {
    id: "dusting",
    label: "Dusting",
    text: "Only the frayed few millimetres come off — the “trim” for people trying to grow. Ask by name: “just dusting, a quarter inch max, no layers, no thinning shears.” See the dusting section below.",
  },
];

// --- method by hair type ---------------------------------------------------
export const TYPE_GUIDES = {
  straight: {
    label: "Straight",
    method:
      "Classic wet cut. Straight hair shows every line, so precision matters more than technique — a clean, even perimeter is what makes it look healthy.",
    watchOuts:
      "Two things quietly ruin straight hair: thinning shears through the ends (creates permanent wispy tips) and too many layers (the ends go see-through). Say “no thinning shears below the mid-lengths” out loud.",
    bestShapes: ["blunt", "u-shape", "bob-lob", "face-framing", "internal"],
  },
  wavy: {
    label: "Wavy",
    method:
      "You get a real choice. A classic wet cut gives you clean, controlled lines — best if you often wear your hair straightened or want a strong blunt/U perimeter. A dry cut (cut curl-by-curl, hair dry and in its natural pattern) lets the stylist see where each wave actually falls, so nothing shrinks up shorter than you expected. If you wear your waves natural most of the time, dry-cut it.",
    watchOuts:
      "Waves shrink as they dry — 1–2 inches is normal. If you're cut wet, ask the stylist to leave that shrinkage margin. Over-layering flattens the wave pattern into frizz.",
    bestShapes: ["u-shape", "face-framing", "long-layers", "butterfly", "shag"],
  },
  curly: {
    label: "Curly",
    method:
      "Dry, curl-by-curl (a curly cut — DevaCut, Rëzo, or any curl-trained stylist's version). Each curl is shaped where it actually lives, so you see the result as it's happening. A Rëzo-style cut works around the head in 360° and is the usual fix if your curls keep ending up triangle-shaped.",
    watchOuts:
      "Avoid razor cutting on curls — it frays the ends and invites frizz. Avoid being cut soaking wet unless your stylist genuinely knows your shrinkage. Never let anyone brush curls dry to cut them.",
    bestShapes: ["face-framing", "internal", "long-layers", "shag", "curtain"],
  },
  coily: {
    label: "Coily",
    method:
      "Dry and stretched, or curl-by-curl on defined coils. Because shrinkage can hide 50–75% of your true length, cutting stretched (blown out or banded) is how you get an even shape you can actually see.",
    watchOuts:
      "Ask for shears only — no razors. Bring a photo of the shape you want at YOUR shrinkage, not someone's stretched length. Trim on schedule (every 8–12 weeks) even while growing: coily ends are the most fragile part of any hair type.",
    bestShapes: ["tapered", "internal", "face-framing", "blunt"],
  },
};

// --- goal → cut ------------------------------------------------------------
export const GOAL_CUTS = [
  {
    id: "thickEnds",
    label: "I want the thickest possible ends",
    answer: "Blunt cut — or a U-shape if you want a little softness.",
    text: "Every layer you add removes hair from the perimeter, and the perimeter is what your eye reads as “thick.” Keep it one length, and if you want shape, keep it to a gentle U. Add zero thinning shears. If your hair is fine, a blunt bob or lob concentrates all that density into a shorter line and looks fullest of all.",
    shapes: ["blunt", "u-shape", "bob-lob"],
  },
  {
    id: "volume",
    label: "I want volume and movement",
    answer: "Long layers, shortest layer at or below the collarbone.",
    text: "Layers let the hair above lift off the hair below — that's the whole mechanism of volume. Ask for the shortest layer to land at the collarbone or lower so the ends stay respectable. On wavy and curly hair, layers also let the pattern spring up instead of being weighed down.",
    shapes: ["long-layers", "curtain", "shag"],
  },
  {
    id: "both",
    label: "I want thickness AND volume",
    answer: "Face-framing layers only, plus internal layers if you're thick.",
    text: "This is the combination everyone wants, and the answer is to be surgical about where the layers go. Face-framing pieces give lift and shape exactly where people look at you, while the perimeter stays blunt and dense. If your hair is heavy on top of that, internal (invisible) layers remove weight from inside without touching the ends. Say it exactly like this: “Face-framing layers, blunt perimeter, no layers through the ends.”",
    shapes: ["face-framing", "internal", "u-shape"],
  },
  {
    id: "lessBulk",
    label: "My hair is too heavy / too puffy",
    answer: "Internal layers, or a V-shape if you want dramatic movement.",
    text: "Bulk gets removed from the inside, not the outline. Internal layers thin the interior and let everything else lie down while your ends stay full. A V-shape goes further, removing perimeter weight for real swing — just know you're trading end thickness for it. Thinning shears are fine ONLY on genuinely thick hair, used at the interior, never on the last two inches.",
    shapes: ["internal", "v-shape", "long-layers"],
  },
  {
    id: "growLonger",
    label: "I'm growing it out",
    answer: "Dusting every 8–12 weeks. Nothing else.",
    text: "Cutting doesn't make hair grow faster — but split ends travel up the strand, and a split that reaches your mid-lengths costs you far more length than a dusting would have. Book “dusting only, quarter inch, no layers.” If you're growing out old layers, ask your stylist to cut only the shortest layer each visit so the rest catches up.",
    shapes: ["dusting", "u-shape"],
  },
  {
    id: "definition",
    label: "I want my curls to actually clump and define",
    answer: "A dry curl-by-curl cut, with layers placed to release the pattern.",
    text: "Undefined curls are often over-weighted curls: too much length pulling the pattern straight. A curl-trained stylist removes weight from the specific curls that are dragging, which lets the rest spring. This is the one goal where the METHOD matters more than the shape — book someone who cuts curls dry.",
    shapes: ["face-framing", "internal", "long-layers"],
  },
  {
    id: "faceFraming",
    label: "I want it to flatter my face",
    answer: "Face-framing layers or curtain bangs, placed at your best feature.",
    text: "The shortest face-framing piece draws the eye — so put it where you want attention. Cheekbones for lift, jaw for softening a strong jawline, brow-length curtain bangs to shorten a long forehead. Read the golden-ratio section below for length.",
    shapes: ["face-framing", "curtain", "butterfly"],
  },
  {
    id: "lowMaintenance",
    label: "I want low maintenance",
    answer: "U-shape or a long bob, minimal layers.",
    text: "Fewer layers means fewer pieces that need styling to look intentional. A U-shape or lob air-dries well and grows out without a visible “shelf.” Skip fringes unless you're willing to trim them every 3–4 weeks.",
    shapes: ["u-shape", "bob-lob", "butterfly"],
  },
  {
    id: "damage",
    label: "My ends are fried / broken",
    answer: "Cut above the damage — then dust regularly.",
    text: "Split ends cannot be repaired, only removed; bond treatments buy you time but a split still travels. The honest move is to cut above the worst of it once, then protect what's left. If most of your damage is a distinct line (a bleach line, a heat line), cutting to it in one visit beats a year of chasing it.",
    shapes: ["blunt", "dusting", "u-shape"],
  },
];

// --- the golden ratio -------------------------------------------------------
export const GOLDEN_RATIO = {
  heading: "📏 Every length can look good — but here's your “golden ratio” length",
  body: [
    "First, the important part: there is no length you're not allowed to wear. If you want it, wear it. This is a guideline for when you're undecided, not a rule.",
    "The idea comes from the golden ratio — the proportion 1.618, the same number the Fibonacci sequence approaches, which shows up so often in faces and nature that researchers have used it as a shorthand for “balanced.” A plastic surgeon (Dr. Yaker) applied it to hair length, and it's since spread as the “2.25 inch rule.”",
  ],
  how: [
    "Grab a ruler and a pencil (or a chopstick, or any straight thing).",
    "Hold the pencil horizontally under your chin, flat.",
    "Hold the ruler vertically against the pencil, running up to just below your earlobe.",
    "Measure the distance from the bottom of your earlobe down to the pencil.",
  ],
  verdict: [
    "**Under 2.25 inches (5.7 cm)** → shorter hair (chin-length or above — a bob, a lob) tends to flatter your proportions most.",
    "**Over 2.25 inches** → longer hair (past the collarbone) tends to balance your face best.",
    "**Right around 2.25 inches** → you're in the lucky middle; almost anything works, so choose by lifestyle instead.",
  ],
  caveat:
    "Treat it like a starting suggestion. Your hair's density, your neck length, your glasses, how you part it, and — most of all — what you actually like will all outrank a tape measure.",
};

// --- face shape: find yours, then cut to flatter it ------------------------
export const FACE_SHAPE = {
  heading: "🪞 Find your face shape (then cut to flatter it)",
  intro: [
    "Face shape is the other half of choosing a cut — it decides where length and volume should sit. Work through these steps once and you'll know yours for life.",
    "**Set up first:** pull all your hair back off your face. Take off glasses. Relaxed face — no smiling. You're only looking at the outline.",
  ],
  steps: [
    {
      label: "Step 1 — Which part of your face is widest?",
      text: "Forehead, cheekbones, or jaw? (Or is everything roughly the same width?) That answer sends you to one of the branches below.",
    },
    {
      label: "If your FOREHEAD is widest",
      text: "Pointy chin? → **Heart** or **inverted triangle**. Then check the jaw: soft and rounded → **Heart**. Sharper, more angular → **Inverted triangle**. No pointy chin at all → you're likely **Oval** or **Oblong**, decided by length in step 3.",
    },
    {
      label: "If your CHEEKBONES are widest",
      text: "Pointy chin? → **Diamond**. Not pointy → **Oval**. Small forehead alongside those cheekbones pushes it further toward **Diamond**.",
    },
    {
      label: "If your JAW is widest",
      text: "Very square jaw → **Square**. Not square, just wider than your forehead → **Pear** (also called triangle). The difference: square means forehead and jaw are about the same width; pear means the jaw is noticeably wider.",
    },
    {
      label: "If EVERYTHING is about the same width",
      text: "Now it's about length. Longer than it is wide → **Oval**. Much longer than wide (roughly 1.6× or more) → **Oblong**. About as long as it is wide → **Round** or **Square**, decided by your corners.",
    },
    {
      label: "Step 2 — Check your corners",
      text: "Your corners are where the jaw changes direction, roughly below your ears. Is there a noticeable angle there, or does it curve smoothly? Sharp angle → **Square**. Soft and smooth → **Round**.",
    },
    {
      label: "Step 3 — How long is your face?",
      text: "About as long as it is wide → **Round** or **Square**. Longer than wide → **Oval**. Much longer than wide (about 1.6× or more) → **Oblong**.",
    },
    {
      label: "Step 4 — Check the sides",
      text: "Do the sides run straight down? → **Square** or **Oblong**. Do they curve inward toward the chin? → **Oval**.",
    },
    {
      label: "Step 5 — Take the most common answer",
      text: "Run all the steps and pick whichever shape came up most often — you're not looking for a perfect match, just the closest one. Example: if your answers land on Oval, Oval/Oblong/Heart, Oval/Round, and Oval, you're an **Oval**.",
    },
  ],
  shapes:
    "The nine shapes: **Oval · Round · Square · Rectangle · Oblong · Heart · Inverted triangle · Diamond · Triangle (pear)**.",
};

// Which goals matter for THIS person, in priority order, derived from
// their quiz answers.
function goalsFor(p) {
  const picked = [];
  const add = (id) => {
    if (id && !picked.includes(id)) picked.push(id);
  };
  const has = (arr, v) => Array.isArray(arr) && arr.includes(v);
  const textured = ["wavy", "curly", "coily"].includes(p.hairType);

  if (has(p.goals, "density") || has(p.concerns, "thinning")) add("both");
  if (p.density === "fine") add("thickEnds");
  if (has(p.concerns, "breakage") || has(p.goals, "repair")) add("damage");
  if (has(p.goals, "growLonger") || has(p.concerns, "slowGrowth")) add("growLonger");
  if (has(p.concerns, "curlyNew") || (textured && (has(p.concerns, "frizz") || has(p.goals, "frizz"))))
    add("definition");
  if (p.density === "thick") add("lessBulk");
  if (has(p.goals, "maintain")) add("lowMaintenance");
  if (!textured && (has(p.concerns, "frizz") || has(p.goals, "frizz"))) add("damage");
  if (picked.length === 0) add("faceFraming");
  return picked.slice(0, 4).map((id) => GOAL_CUTS.find((g) => g.id === id)).filter(Boolean);
}

const shapeById = (id) => CUT_SHAPES.find((s) => s.id === id);

// The Haircut tab, personalized: your branch of the tree first, then the
// full reference underneath so nothing is hidden.
export function buildHaircutSections(p) {
  const sections = [];
  const guide = p.hairType ? TYPE_GUIDES[p.hairType] : null;

  if (guide) {
    sections.push({
      heading: `✂️ Step 1 — how ${guide.label.toLowerCase()} hair should be cut`,
      body: [guide.method, guide.watchOuts],
    });
  } else {
    sections.push({
      heading: "✂️ Step 1 — how your hair should be cut",
      body: [
        "Take the quiz and this step names the right cutting method for your exact hair type. In the meantime, the full reference for all four types is below.",
      ],
    });
  }

  sections.push({
    heading: "🧮 Step 2 — be honest about maintenance",
    body: [
      "A haircut is only as good as the version of it you'll actually wear. Some cuts only look right styled — and if you don't style, that cut will disappoint you every single day.",
      "Before you book, answer these: **How much time do you really have in the morning? Do you use heat? Do you style at all, or air-dry and go? Do you WANT to start styling — honestly?**",
      "A heavily textured, heavily layered cut on someone who air-dries and never touches a round brush is the #1 way people end up hating a technically good haircut. Tell your stylist your real routine, not your aspirational one.",
    ],
  });

  const myGoals = goalsFor(p);
  sections.push({
    heading: "🎯 Step 3 — your goal decides the shape",
    body: [
      p.hasQuiz
        ? "Based on your quiz answers, these are the branches that apply to you — in order:"
        : "Find your goal below. Every goal leads to a different shape:",
    ],
    items: myGoals.map((g) => ({ label: `${g.label} → ${g.answer}`, text: g.text })),
  });

  // the specific shapes those goals point at, explained
  const shapeIds = [...new Set(myGoals.flatMap((g) => g.shapes))];
  if (guide) for (const s of guide.bestShapes) if (!shapeIds.includes(s)) shapeIds.push(s);
  sections.push({
    heading: "🔤 Step 4 — the letter shapes, decoded",
    body: [
      "Blunt, U, V — these describe the outline of your hair when you look at it from behind. It's the single biggest decision for how thick your ends look:",
    ],
    items: shapeIds.map(shapeById).filter(Boolean).map((s) => ({ label: s.label, text: s.text })),
  });

  sections.push({
    heading: "⚠️ Two things that quietly ruin a good cut",
    items: [
      {
        label: "An uneven part will fake a bad haircut",
        text: "If you part your hair off-centre and then bring it forward over your shoulders, one side can look four inches shorter than the other — even though the cut is perfectly even. Before you panic (or ask for a correction), part it dead centre and check again.",
      },
      {
        label: "Cowlicks decide where bangs can go",
        text: "Find your cowlicks before anyone cuts a fringe — hair that grows in a swirl will never lie the way a photo does. Forehead size matters too: a small forehead can mean bangs get cut shorter than you expected once they're shaped.",
      },
    ],
  });

  sections.push({
    heading: FACE_SHAPE.heading,
    body: FACE_SHAPE.intro,
    items: FACE_SHAPE.steps,
    images: [{ caption: "Face shape chart — all nine shapes" }],
    footer: FACE_SHAPE.shapes,
  });

  sections.push({
    heading: GOLDEN_RATIO.heading,
    body: [...GOLDEN_RATIO.body, "**How to measure it:**", ...GOLDEN_RATIO.how.map((h, i) => `${i + 1}. ${h}`), ...GOLDEN_RATIO.verdict, GOLDEN_RATIO.caveat],
  });

  sections.push({ heading: STYLIST_SCRIPT.heading, body: STYLIST_SCRIPT.body, items: STYLIST_SCRIPT.items });

  sections.push({
    heading: "🪒 Dusting — the trim that doesn't cost you length",
    body: [
      "Dusting removes only the frayed tips — often a quarter inch or less — so the shape and length stay exactly where they are. It's the right call between real cuts, and the only “trim” that makes sense while you're growing.",
      "How to ask: “Dusting only — a quarter inch max, no layers, no thinning shears.” Every 8–12 weeks is plenty for most people; every 6–8 if your ends are fragile or coily.",
      "Reality check: dusting maintains, it doesn't rescue. If your ends are visibly split several inches up, one honest cut above the damage will save you a year of chasing it.",
    ],
  });

  sections.push({
    heading: "⚠️ Skip the at-home split-end gadgets",
    body: [
      "The battery-powered “split-end trimmers” promise a salon dusting at home. In practice they cut at an inconsistent length, chew rather than slice (a blunt cut edge splits again faster), miss the splits that matter, and can pull hair into the mechanism. The blades also dull quickly, which makes all of the above worse.",
      "Same caution for cutting your own ends with kitchen or craft scissors — they crush the strand instead of cutting it cleanly, and a crushed end splits within weeks. If you cut at home, use actual hair shears, cut tiny amounts, and never cut curly hair while it's stretched straight.",
      "The safe home version is search-and-destroy: twist a small section, snip only the individual split hairs that pop out, and stop after ten minutes.",
    ],
  });

  return sections;
}

export const STYLIST_SCRIPT = {
  heading: "🗣️ What to say at the salon (copy this)",
  body: [
    "Stylists can only deliver what they understand you to mean. These four sentences prevent almost every bad haircut:",
  ],
  items: [
    { label: "1. Name the shape, not the vibe", text: "“I want a blunt perimeter with face-framing layers” beats “something fresh but not too different.”" },
    { label: "2. Set the number", text: "“Take off half an inch — show me on your fingers before you start.” Then confirm what you see." },
    { label: "3. Protect the ends", text: "“No thinning shears through the ends, no razor.” Say it even if you think they wouldn't." },
    { label: "4. Say how you actually wear it", text: "“I air-dry and never use hot tools” changes the whole cut — a stylist cutting for a blowout you'll never do is why hair “only looks good at the salon.”" },
  ],
};
