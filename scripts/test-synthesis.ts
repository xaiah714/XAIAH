/**
 * Manual verification for the AI answer-synthesis prompt (src/lib/ai.ts).
 *
 * Runs the real synthesizeVerifiedAnswers() function against two sample
 * questions in different subjects, each with two mock verified tutor
 * answers, and prints the full outputs so a human can judge them against
 * the four launch criteria printed at the end.
 *
 * Usage (needs ANTHROPIC_API_KEY in .env or the environment):
 *   npx tsx scripts/test-synthesis.ts
 */
import "dotenv/config";
import { synthesizeVerifiedAnswers } from "../src/lib/ai";

const CASES = [
  {
    label: "MATH — Solve 2x + 6 = 14",
    title: "How do I solve 2x + 6 = 14?",
    body: "I don't get how to find x. We just started algebra.",
    answers: [
      {
        tutorName: "Tutor A",
        reasoning:
          "We want x alone on one side. First undo the +6 by subtracting 6 from both sides: 2x + 6 - 6 = 14 - 6, so 2x = 8. Then undo the multiplication by 2 by dividing both sides by 2: x = 4. Check it: 2(4) + 6 = 8 + 6 = 14. ✓",
        body: "x = 4",
      },
      {
        tutorName: "Tutor B",
        reasoning:
          "Read the equation as a sentence: two times a mystery number, plus 6, gives 14. Take the 6 back off of 14 and you have 8 left — that's what 'two times the number' equals. Half of 8 is 4, so the mystery number is 4.",
        body: "x = 4",
      },
    ],
  },
  {
    label: "PSYCHOLOGY — Classical vs. operant conditioning",
    title: "What's the difference between classical and operant conditioning?",
    body: "My textbook defines both but I keep mixing them up on quizzes.",
    answers: [
      {
        tutorName: "Tutor A",
        reasoning:
          "Classical conditioning is learning by association: a neutral signal gets paired with something that already triggers an automatic response, until the signal alone triggers it (Pavlov's dogs salivating at a bell). The response is involuntary. Operant conditioning is learning from consequences: a voluntary behavior becomes more or less likely because of the reward or punishment that follows it (Skinner's rats pressing a lever for food).",
        body:
          "Classical = pairing signals with automatic responses; operant = consequences shaping voluntary behavior.",
      },
      {
        tutorName: "Tutor B",
        reasoning:
          "A timing trick that works on quizzes: in classical conditioning the learning happens BEFORE the behavior — a signal predicts something is coming, and the body reacts on its own. In operant conditioning the learning happens AFTER the behavior — the animal does something, then the consequence teaches it to repeat or avoid it. Dog drools when it hears the bell = classical. Dog sits because sitting earned a treat last time = operant.",
        body:
          "Classical: signal before an automatic reaction. Operant: consequence after a chosen action.",
      },
    ],
  },
];

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      "ANTHROPIC_API_KEY is not set — synthesizeVerifiedAnswers() will log its dev-fallback skip for each case below.\n" +
        "Add the key to .env and re-run to get real outputs.\n",
    );
  }

  for (const c of CASES) {
    console.log("=".repeat(72));
    console.log(`CASE: ${c.label}`);
    console.log("=".repeat(72));
    const started = Date.now();
    const result = await synthesizeVerifiedAnswers(c.title, c.body, c.answers);
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    if (result === null) {
      console.log(`\n(no synthesis produced — see log line above; ${secs}s)\n`);
    } else {
      console.log(`\n--- SYNTHESIS OUTPUT (${secs}s) ---\n`);
      console.log(result);
      console.log("\n--- END OUTPUT ---\n");
    }
  }

  console.log("Judge each output against:");
  console.log("  1. Does it explain WHY, not just restate the answer?");
  console.log("  2. Would it genuinely make sense to a much younger reader (no jargon)?");
  console.log("  3. Does the tone read warm/patient rather than corporate or robotic?");
  console.log("  4. Does it stay within the mock tutors' reasoning (no new problem-solving)?");
}

main();
