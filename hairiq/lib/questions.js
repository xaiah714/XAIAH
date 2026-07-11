// ---------------------------------------------------------------------------
// HairIQ — Quiz questions (spec section 5)
// 11 questions, one per screen. Q7 (chemical treatments) is multi-select,
// everything else single. Edit copy freely — the quiz UI renders whatever
// is in this file.
// ---------------------------------------------------------------------------

export const QUESTIONS = [
  {
    id: "hairType",
    title: "What's your hair type?",
    subtitle: "Go with how it dries naturally, no products.",
    options: [
      { value: "straight", label: "Straight", emoji: "📏" },
      { value: "wavy", label: "Wavy", emoji: "🌊" },
      { value: "curly", label: "Curly", emoji: "➰" },
      { value: "coily", label: "Coily", emoji: "🌀" },
    ],
  },
  {
    id: "density",
    title: "How dense is your hair?",
    subtitle: "Think about how much hair you have overall, not the width of each strand.",
    options: [
      { value: "fine", label: "Fine", emoji: "🪶" },
      { value: "medium", label: "Medium", emoji: "🌾" },
      { value: "thick", label: "Thick", emoji: "🦁" },
      { value: "unsure", label: "Not sure", sublabel: "New to this — totally fine", emoji: "🤷" },
    ],
  },
  {
    id: "length",
    title: "How long is your hair?",
    subtitle: "Some steps only earn their keep past a certain length.",
    options: [
      { value: "short", label: "Short", sublabel: "Above the shoulders", emoji: "✂️" },
      { value: "medium", label: "Medium", sublabel: "Shoulder to mid-back", emoji: "💁‍♀️" },
      { value: "long", label: "Long", sublabel: "Mid-back to waist", emoji: "🧜‍♀️" },
      { value: "extraLong", label: "Extra long", sublabel: "Past the waist", emoji: "👸" },
    ],
  },
  {
    id: "scalp",
    title: "How would you describe your scalp?",
    options: [
      { value: "oily", label: "Oily", sublabel: "Greasy by the end of the day", emoji: "💧" },
      { value: "dry", label: "Dry & flaky", emoji: "🏜️" },
      { value: "sensitive", label: "Sensitive or irritated", emoji: "🩹" },
      { value: "balanced", label: "Balanced", sublabel: "No complaints", emoji: "⚖️" },
    ],
  },
  {
    id: "concern",
    title: "What's your main hair concern?",
    subtitle: "Pick the one that bugs you most — it drives your whole routine.",
    options: [
      { value: "thinning", label: "Thinning or density loss", emoji: "🍂" },
      { value: "dryness", label: "Dryness or damage", emoji: "🥀" },
      { value: "frizz", label: "Frizz", emoji: "⚡" },
      { value: "breakage", label: "Breakage & split ends", emoji: "💔" },
      { value: "dandruff", label: "Dandruff or flaking", emoji: "❄️" },
      { value: "slowGrowth", label: "Slow growth", emoji: "🐌" },
      {
        value: "curlyNew",
        label: "New to curly or wavy hair",
        sublabel: "I need a styling routine",
        emoji: "✨",
      },
    ],
  },
  {
    id: "goal",
    title: "What's your main goal?",
    options: [
      { value: "growLonger", label: "Grow it longer", emoji: "🌱" },
      { value: "density", label: "Increase density", emoji: "🌳" },
      { value: "repair", label: "Repair damage", emoji: "🛠️" },
      { value: "frizz", label: "Reduce frizz", emoji: "😌" },
      { value: "scalpHealth", label: "Improve scalp health", emoji: "💆" },
      { value: "maintain", label: "Just maintain", emoji: "✅" },
    ],
  },
  {
    id: "chemical",
    title: "Any chemical treatments?",
    subtitle: "Select all that apply.",
    multiSelect: true,
    options: [
      { value: "salonColor", label: "Salon color, no bleach", emoji: "🎨" },
      { value: "bleach", label: "Bleached", emoji: "🫧" },
      { value: "boxDye", label: "Box dye at home, no bleach", emoji: "📦" },
      { value: "relaxer", label: "Relaxed or permed", emoji: "🧪" },
      { value: "keratin", label: "Keratin or smoothing treatment", emoji: "💫" },
      { value: "none", label: "None", emoji: "🚫", exclusive: true },
    ],
  },
  {
    id: "heat",
    title: "How often do you heat style?",
    subtitle: "Blow dryer, flat iron, curling iron — any hot tool counts.",
    options: [
      { value: "daily", label: "Daily", emoji: "🔥" },
      { value: "weekly", label: "A few times a week", emoji: "♨️" },
      { value: "rarely", label: "Rarely or never", emoji: "🙅" },
    ],
  },
  {
    id: "washFreq",
    title: "How often do you wash your hair?",
    options: [
      { value: "daily", label: "Daily", emoji: "📅" },
      { value: "everyOther", label: "Every other day", emoji: "🔁" },
      { value: "twiceWeek", label: "Twice a week", emoji: "✌️" },
      { value: "weekly", label: "Weekly or less", emoji: "🗓️" },
    ],
  },
  {
    id: "time",
    title: "How much time do you have for a routine?",
    subtitle: "Be honest — a routine you'll actually do beats a perfect one you won't.",
    options: [
      { value: "five", label: "5 min or less", emoji: "⚡" },
      { value: "fifteen", label: "10–15 min", emoji: "⏱️" },
      { value: "twentyPlus", label: "20+ min", emoji: "🧖" },
    ],
  },
  {
    id: "priority",
    title: "What matters most in product picks?",
    subtitle: "This just sets which tab you land on — you can always flip between all three.",
    options: [
      { value: "drugstore", label: "Budget-friendly", sublabel: "Drugstore picks", emoji: "💸" },
      { value: "luxury", label: "Luxury", sublabel: "Treat-yourself picks", emoji: "✨" },
      { value: "crueltyFree", label: "Cruelty-free", sublabel: "Certified & verified brands", emoji: "🐰" },
    ],
  },
];

export function isAnswered(answers, question) {
  const value = answers[question.id];
  if (question.multiSelect) return Array.isArray(value) && value.length > 0;
  return value != null && value !== "";
}

export function isQuizComplete(answers) {
  return QUESTIONS.every((q) => isAnswered(answers, q));
}
