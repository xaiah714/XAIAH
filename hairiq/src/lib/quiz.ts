/**
 * Quiz definitions. 10 questions, one per screen.
 * Q6 (chemical) is multi-select; everything else is single-select.
 *
 * Content lives here (not in components) so questions can be reworded,
 * reordered, or extended without touching any UI code.
 */

export type QuestionKey =
  | "hairType"
  | "density"
  | "scalp"
  | "concern"
  | "goal"
  | "chemical"
  | "heat"
  | "washFreq"
  | "time"
  | "priority";

/** Answers keyed by question. Multi-select questions store a string[]. */
export type Answers = Partial<Record<QuestionKey, string | string[]>>;

export interface QuizOption {
  value: string;
  label: string;
  /** Small line under the label for options that need a nudge of context. */
  sublabel?: string;
  emoji: string;
}

export interface QuizQuestion {
  key: QuestionKey;
  prompt: string;
  help?: string;
  multi?: boolean;
  /** For multi-select: picking this value clears the others (e.g. "None"). */
  exclusiveValue?: string;
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = [
  {
    key: "hairType",
    prompt: "What's your hair type?",
    help: "Go with how it dries naturally, with no product in.",
    options: [
      { value: "straight", label: "Straight", emoji: "📏" },
      { value: "wavy", label: "Wavy", emoji: "🌊" },
      { value: "curly", label: "Curly", emoji: "➰" },
      { value: "coily", label: "Coily", emoji: "🌀" },
    ],
  },
  {
    key: "density",
    prompt: "How would you describe your hair's density?",
    help: "Density is how much hair you have overall — not how thick each strand is.",
    options: [
      { value: "fine", label: "Fine", emoji: "🪶" },
      { value: "medium", label: "Medium", emoji: "🌾" },
      { value: "thick", label: "Thick", emoji: "🦁" },
      {
        value: "notSure",
        label: "Not sure — new to this",
        sublabel: "Totally fine! We'll pick beginner-friendly options.",
        emoji: "🤷",
      },
    ],
  },
  {
    key: "scalp",
    prompt: "How does your scalp usually feel?",
    options: [
      { value: "oily", label: "Oily", sublabel: "Greasy by end of day", emoji: "💧" },
      { value: "dry", label: "Dry & flaky", emoji: "🏜️" },
      { value: "sensitive", label: "Sensitive or irritated", emoji: "🌡️" },
      { value: "balanced", label: "Balanced", sublabel: "No complaints", emoji: "😌" },
    ],
  },
  {
    key: "concern",
    prompt: "What's your main hair concern right now?",
    help: "Pick the one that bothers you most — it drives your routine.",
    options: [
      { value: "thinning", label: "Thinning or density loss", emoji: "🍂" },
      { value: "dryness", label: "Dryness or damage", emoji: "🥀" },
      { value: "frizz", label: "Frizz", emoji: "⚡" },
      { value: "breakage", label: "Breakage & split ends", emoji: "✂️" },
      { value: "dandruff", label: "Dandruff or flaking", emoji: "❄️" },
      { value: "growth", label: "Slow growth", emoji: "🐢" },
      {
        value: "curlyBeginner",
        label: "New to curly or wavy — need a styling routine",
        emoji: "🌱",
      },
    ],
  },
  {
    key: "goal",
    prompt: "What's your main goal?",
    options: [
      { value: "grow", label: "Grow it longer", emoji: "🌻" },
      { value: "density", label: "Increase density", emoji: "🌳" },
      { value: "repair", label: "Repair damage", emoji: "🩹" },
      { value: "frizz", label: "Reduce frizz", emoji: "🧘" },
      { value: "scalpHealth", label: "Improve scalp health", emoji: "🌿" },
      { value: "maintain", label: "Just maintain", emoji: "✨" },
    ],
  },
  {
    key: "chemical",
    prompt: "Any chemical treatments?",
    help: "Select all that apply.",
    multi: true,
    exclusiveValue: "none",
    options: [
      { value: "salonColor", label: "Salon color, no bleach", emoji: "🎨" },
      { value: "bleach", label: "Bleached", emoji: "⚪" },
      { value: "boxDye", label: "Box dye at home, no bleach", emoji: "📦" },
      { value: "relaxer", label: "Relaxed or permed", emoji: "🧪" },
      { value: "keratin", label: "Keratin or smoothing treatment", emoji: "💆" },
      { value: "none", label: "None", emoji: "🙅" },
    ],
  },
  {
    key: "heat",
    prompt: "How often do you heat style?",
    help: "Blow dryers, flat irons, curling wands — all of it.",
    options: [
      { value: "daily", label: "Daily", emoji: "🔥" },
      { value: "weekly", label: "A few times a week", emoji: "♨️" },
      { value: "rarely", label: "Rarely or never", emoji: "🍃" },
    ],
  },
  {
    key: "washFreq",
    prompt: "How often do you wash your hair?",
    help: "No wrong answers — we'll fit the routine to your rhythm.",
    options: [
      { value: "daily", label: "Daily", emoji: "🚿" },
      { value: "everyOther", label: "Every other day", emoji: "📆" },
      { value: "twiceWeek", label: "Twice a week", emoji: "✌️" },
      { value: "weekly", label: "Weekly or less", emoji: "🗓️" },
    ],
  },
  {
    key: "time",
    prompt: "How much time do you have for a routine?",
    options: [
      { value: "five", label: "5 min or less", emoji: "⚡" },
      { value: "fifteen", label: "10–15 min", emoji: "⏲️" },
      { value: "twentyPlus", label: "20+ min", emoji: "🛁" },
    ],
  },
  {
    key: "priority",
    prompt: "What matters most in your product picks?",
    help: "This just sets your default tab — you'll get all three either way, and can switch anytime.",
    options: [
      { value: "drugstore", label: "Budget-friendly", sublabel: "Drugstore picks", emoji: "🛒" },
      { value: "luxury", label: "Luxury", sublabel: "Premium picks", emoji: "💎" },
      {
        value: "vegan",
        label: "Vegan & cruelty-free",
        sublabel: "Certified-kind picks",
        emoji: "🐰",
      },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

/** True once every question has a usable answer. */
export function isComplete(answers: Answers): boolean {
  return QUESTIONS.every((q) => {
    const a = answers[q.key];
    if (q.multi) return Array.isArray(a) && a.length > 0;
    return typeof a === "string" && a.length > 0;
  });
}

/** Index of the first unanswered question (for resuming a refreshed quiz). */
export function firstUnanswered(answers: Answers): number {
  const idx = QUESTIONS.findIndex((q) => {
    const a = answers[q.key];
    if (q.multi) return !Array.isArray(a) || a.length === 0;
    return typeof a !== "string" || a.length === 0;
  });
  return idx === -1 ? QUESTIONS.length - 1 : idx;
}

export function optionLabel(key: QuestionKey, value: string): string {
  const q = QUESTIONS.find((question) => question.key === key);
  return q?.options.find((o) => o.value === value)?.label ?? value;
}
