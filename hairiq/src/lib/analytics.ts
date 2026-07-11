/**
 * Analytics stub. v1 collects nothing and sends nothing anywhere —
 * events are logged to the console in development only.
 *
 * When you pick a provider (Plausible, PostHog, GA4, …), wire it inside
 * track() and every existing call site lights up. Event names below are
 * already instrumented throughout the app:
 *
 *   quiz_started, question_answered, quiz_completed,
 *   results_viewed, tier_tab_switched, retake_clicked
 */

export type AnalyticsEvent =
  | "quiz_started"
  | "question_answered"
  | "quiz_completed"
  | "results_viewed"
  | "tier_tab_switched"
  | "retake_clicked";

export function track(event: AnalyticsEvent, props?: Record<string, string | number>) {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[analytics] ${event}`, props ?? {});
  }
  // v1: intentionally a no-op in production. Wire your provider here.
}
