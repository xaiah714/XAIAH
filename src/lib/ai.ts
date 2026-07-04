import Anthropic from "@anthropic-ai/sdk";

// Deliberate quality-over-cost choice: Fable 5 for synthesis (it costs more
// per call than Opus/Sonnet — see BUILD_PLAN.md). Fable's safety layer can
// occasionally decline benign academic content, so the request carries a
// server-side fallback to Opus 4.8: if Fable declines, the same request is
// re-served by Opus inside the same call instead of the student silently
// getting no summary.
const MODEL = "claude-fable-5";
const FALLBACK_MODEL = "claude-opus-4-8";

type VerifiedAnswer = { tutorName: string; reasoning: string; body: string };

/**
 * Compares 2+ already human-verified tutor answers to the same question and
 * produces one simplified explanation for the student. This must never
 * introduce new problem-solving of its own — only format/reconcile reasoning
 * tutors have already written and verified. The system prompt constrains this
 * explicitly; callers should only invoke this once >=2 verified-tutor answers
 * already exist on a question.
 *
 * Returns null (and logs) if ANTHROPIC_API_KEY isn't set or the call fails,
 * matching the Resend/Stripe dev-fallback pattern elsewhere in this app —
 * synthesis is a nice-to-have layered on top of answers that are already
 * fully usable on their own.
 */
export async function synthesizeVerifiedAnswers(
  questionTitle: string,
  questionBody: string,
  answers: VerifiedAnswer[],
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.log(
      `[ai:dev-fallback] Skipping answer synthesis for "${questionTitle}" — ANTHROPIC_API_KEY not set.`,
    );
    return null;
  }

  const client = new Anthropic({ apiKey });

  const answersBlock = answers
    .map(
      (a, i) =>
        `Verified tutor answer #${i + 1} (by ${a.tutorName}):\nReasoning: ${a.reasoning}\nFinal answer: ${a.body}`,
    )
    .join("\n\n");

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4096,
      betas: ["server-side-fallback-2026-06-01"],
      fallbacks: [{ model: FALLBACK_MODEL }],
      // Fable 5 always thinks; "adaptive" is the only accepted configuration.
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system:
        "You are helping synthesize verified tutor answers for a student-first, affordable alternative to Chegg. This platform " +
        "exists to genuinely help students, not just deliver fast answers, and is built to be trustworthy enough that education " +
        "organizations like Khan Academy would see it as a credible, values-aligned partner. Explain like a patient, caring tutor " +
        "who wants the student to actually understand — not like a company trying to sound impressive or move quickly.\n\n" +
        "Every tutor answer you were given has already been reviewed and confirmed correct by a human expert. Your only job is to " +
        "combine, simplify, and clarify their existing reasoning for the student. Do not introduce any new problem-solving, new " +
        "steps, new facts, or reasoning that isn't already present in the provided answers. If the answers genuinely disagree on " +
        "the final result, say so plainly instead of picking a side.\n\n" +
        "Hard requirement for every explanation — not a stylistic suggestion: never just state the correct answer. Explain WHY it " +
        "is correct, broken down simply enough that a third grader could follow the reasoning. Use plain words instead of jargon; " +
        "if a technical term is unavoidable, explain what it means in the same breath. Short sentences, one idea at a time.\n\n" +
        "Output only the explanation itself, no preamble.",
      messages: [
        {
          role: "user",
          content: `Question: ${questionTitle}\n${questionBody}\n\n${answersBlock}`,
        },
      ],
    });

    // The whole fallback chain declined — leave the question without a
    // synthesis rather than surface anything partial.
    if (response.stop_reason === "refusal") {
      console.warn(
        `[ai] Synthesis declined by the model for "${questionTitle}"` +
          (response.stop_details?.explanation ? `: ${response.stop_details.explanation}` : ""),
      );
      return null;
    }

    const text = response.content.find((b) => b.type === "text");
    return text?.type === "text" && text.text.trim() ? text.text.trim() : null;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`[ai] Synthesis failed (${error.status}):`, error.message);
    } else {
      console.error("[ai] Synthesis failed:", error);
    }
    return null;
  }
}
