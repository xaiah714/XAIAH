/**
 * Long-running scheduler for Railway (replaces Vercel Cron).
 *
 * Runs as its own Railway service (start command: `npm run cron:worker`)
 * against the same database as the web app:
 *   - unanswered-question sweep: every 5 minutes (15-min delay notice,
 *     30-min second-opinion auto-escalation — src/lib/question-sweep.ts)
 *   - weekly tutor payouts: Mondays 12:00 UTC (src/lib/payouts.ts)
 *
 * The sweep is idempotent (per-question timestamps), so restarts are safe.
 * The weekly run is guarded two ways: an in-process key (one run per
 * Monday-hour) plus a database check (skip if any payout was created in the
 * last 6 days), so a worker restart during the Monday window can't create
 * duplicate payouts.
 *
 * The bearer-protected HTTP endpoints (/api/cron/*) still exist for manual
 * triggers; this worker calls the same functions directly.
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { sweepUnansweredQuestions } from "../src/lib/question-sweep";
import { runWeeklyPayouts } from "../src/lib/payouts";

const TICK_MS = 60 * 1000;
const SWEEP_EVERY_MS = 5 * 60 * 1000;
const WEEKLY_UTC_DAY = 1; // Monday
const WEEKLY_UTC_HOUR = 12;

let lastSweepBucket = -1;
let lastWeeklyKey = "";

async function maybeSweep(now: Date) {
  const bucket = Math.floor(now.getTime() / SWEEP_EVERY_MS);
  if (bucket === lastSweepBucket) return;
  lastSweepBucket = bucket;
  const results = await sweepUnansweredQuestions(now);
  if (results.delayNoticesSent > 0 || results.escalated > 0) {
    console.log(`[cron-worker] sweep:`, results);
  }
}

async function maybeRunWeeklyPayouts(now: Date) {
  if (now.getUTCDay() !== WEEKLY_UTC_DAY || now.getUTCHours() !== WEEKLY_UTC_HOUR) return;
  const key = now.toISOString().slice(0, 10); // one attempt window per Monday
  if (lastWeeklyKey === key) return;
  lastWeeklyKey = key;

  const recent = await prisma.payout.findFirst({
    where: { createdAt: { gte: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) } },
    select: { id: true },
  });
  if (recent) {
    console.log(`[cron-worker] weekly payouts already ran this week — skipping.`);
    return;
  }

  console.log(`[cron-worker] running weekly payouts...`);
  const results = await runWeeklyPayouts();
  console.log(`[cron-worker] weekly payouts done:`, JSON.stringify(results));
}

async function tick() {
  const now = new Date();
  try {
    await maybeSweep(now);
  } catch (err) {
    console.error(`[cron-worker] sweep failed:`, err);
  }
  try {
    await maybeRunWeeklyPayouts(now);
  } catch (err) {
    console.error(`[cron-worker] weekly payouts failed:`, err);
  }
}

console.log(
  `[cron-worker] started — sweep every 5 min, weekly payouts Mondays ${WEEKLY_UTC_HOUR}:00 UTC.`
);
void tick();
setInterval(() => void tick(), TICK_MS);
