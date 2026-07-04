import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8";

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
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system:
        "You reconcile multiple already-verified human tutor answers to a student's question into one clear, simplified explanation. " +
        "Every tutor answer you were given has already been reviewed and confirmed correct by a human expert — your only job is to " +
        "combine, simplify, and clarify their existing reasoning for the student. Do not introduce any new problem-solving, new steps, " +
        "new facts, or reasoning that isn't already present in the provided answers. If the answers genuinely disagree on the final " +
        "result, say so plainly instead of picking a side. Keep the tone encouraging and simple. Output only the explanation itself, " +
        "no preamble.",
      messages: [
        {
          role: "user",
          content: `Question: ${questionTitle}\n${questionBody}\n\n${answersBlock}`,
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text");
    return text?.type === "text" ? text.text.trim() : null;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`[ai] Synthesis failed (${error.status}):`, error.message);
    } else {
      console.error("[ai] Synthesis failed:", error);
    }
    return null;
  }
}
