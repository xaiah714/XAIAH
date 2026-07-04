# Deploying TutorApp to Vercel (staging)

Everything in the repo is deploy-ready: `vercel.json` registers the two cron
jobs, `npm run build` regenerates the Prisma client before building (the
generated client is gitignored), and every third-party integration degrades
gracefully when its key is missing — so you can deploy *first* and drop in
real Stripe test keys and an Anthropic key later without any code changes.

## One-time setup

1. **Database** — create a hosted Postgres database (Neon, Vercel Postgres,
   and Supabase all work; anything Prisma's `pg` driver can reach). Copy its
   connection string.
2. **Import the repo** at [vercel.com/new](https://vercel.com/new) (framework
   auto-detects as Next.js; no build settings to change), or from a machine
   where you're logged in: `npx vercel`.
3. **Set environment variables** (Vercel → Project → Settings → Environment
   Variables) per the table below, then deploy.
4. **Push the schema and seed the admin** from your local machine against the
   hosted database:

   ```bash
   DATABASE_URL="<hosted-connection-string>" npx prisma db push
   DATABASE_URL="<hosted-connection-string>" ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npm run db:seed
   ```

## Environment variables

| Variable | Required at deploy time? | Notes |
| --- | --- | --- |
| `DATABASE_URL` | **Yes** | Hosted Postgres connection string. |
| `AUTH_SECRET` | **Yes** | `openssl rand -base64 32`. |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `https://<your-app>.vercel.app` — used in emails and Stripe redirect URLs. |
| `CRON_SECRET` | **Yes** | Any random secret. Vercel Cron automatically sends it as the bearer token to the two cron routes; without it the crons get 401s. |
| `RESEND_API_KEY` | No | Blank = verification emails log to the function console (Vercel → Logs) instead of sending. Add the key later; no redeploy-time coupling. |
| `EMAIL_FROM` | No | Sender for Resend, e.g. `TutorApp <hello@yourdomain.com>`. |
| `STRIPE_SECRET_KEY` | No | Test-mode key (`sk_test_...`). Blank = payment flows fail at the point of use with a clear error; everything else works. |
| `STRIPE_WEBHOOK_SECRET` | No | See webhook step below. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Test-mode publishable key. |
| `STRIPE_SUBSCRIPTION_PRICE_ID` / `STRIPE_PAY_PER_SESSION_PRICE_ID` | No | Blank = inline test prices ($7/mo, $3/session). |
| `ANTHROPIC_API_KEY` | No | Blank = the AI answer-synthesis step logs a skip notice and the app runs without the "AI-simplified summary" card. Add the key and it starts working on the next answer — no redeploy needed beyond the env-var save. |

Adding a key later: save it in Vercel's env settings and redeploy (Vercel
prompts you to). Nothing else changes.

## Stripe test-mode wiring (when you have the keys)

1. Set `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test mode).
2. In the Stripe dashboard (test mode) add a webhook endpoint pointed at
   `https://<your-app>.vercel.app/api/stripe/webhook` with events
   `checkout.session.completed`, `invoice.paid`, and `account.updated`;
   copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
3. For tutor payouts, enable Connect in test mode — onboarding from
   `/account/payouts` creates Express accounts automatically.

## Cron jobs

`vercel.json` registers:

- `/api/cron/weekly-payouts` — Mondays 12:00 UTC (the weekly payout run).
- `/api/cron/question-sweep` — every 5 minutes (30-min "still working on it"
  notices + 1-hour second-opinion auto-escalation for unanswered questions).

**Hobby-plan caveat:** Vercel Hobby runs cron jobs at most once per day with
inexact timing, which breaks the question sweep's 30-min/1-hour promises. On
Hobby, either upgrade to Pro or drive the sweep externally — e.g. a GitHub
Actions `schedule:` workflow curling
`https://<your-app>.vercel.app/api/cron/question-sweep` with header
`Authorization: Bearer $CRON_SECRET` every 5 minutes. The routes don't care
who calls them as long as the bearer matches.

## Known staging limitations

- **Photo uploads don't persist.** Uploads write to local disk, which is
  ephemeral on Vercel — uploaded photos 404 after the function instance
  recycles. Fine for a quick look, misleading for real testers; swap
  `src/lib/uploads.ts` to S3/R2/Cloudinary before asking people to test
  photo flows (already tracked in BUILD_PLAN.md).
- **Live chat polls.** The 2.5s polling chat works fine on Vercel, just
  know each open chat window generates steady function invocations.
