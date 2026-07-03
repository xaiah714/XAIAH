# TutorApp — Build Plan & Status

This tracks what's actually built against the product spec, what's stubbed
for phase 2, and the assumptions made along the way. See the original spec
in the task history for full product context (positioning, monetization
model, brand direction, etc).

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack) + TypeScript
- **Tailwind CSS 4** — brand palette (teal + deep purple) defined in
  `src/app/globals.css`
- **Prisma 7** + PostgreSQL, via the `@prisma/adapter-pg` driver adapter
  (Prisma 7 requires an explicit driver adapter — see `src/lib/prisma.ts`)
- **Auth.js (NextAuth) v5**, credentials provider, JWT sessions
- **Stripe** — Checkout for subscriptions and pay-per-session, Billing
  Portal, Connect Express for tutor payouts

Prisma schema: `prisma/schema.prisma`. It models every entity from the
spec: users (student/tutor/admin with subjects, timezone, gender, rating),
questions/answers, chat sessions/messages, subscriptions, payments, tips,
ratings, payouts, and a phase-2 `B2BLicense` table.

## What's built and working end-to-end

1. **Auth + profiles** — signup (student or tutor), login, role-gated
   pages, profile editing (timezone, gender). Verified via browser testing.
2. **Community Q&A** — post a question with an optional photo, browse by
   subject, answer, mark resolved. Always free, no auth required to browse.
3. **Async tutor answers** — tutors get a subject-filtered "batch mode"
   queue of unanswered questions; their answers carry a verified-tutor
   badge distinct from community answers.
4. **Live chat** — subject-based matching against tutors who've toggled
   themselves available (this is the timezone-arbitrage mechanism in
   practice: a tutor only shows as available when they're actually awake).
   Falls back to a claimable "open requests" queue for flexible shift
   claiming when no one's immediately free. Polling-based chat UI (2.5s),
   not WebSockets — fine for v1 traffic, worth revisiting if concurrent
   session volume gets heavy.
5. **Payments** — Stripe Checkout for the $5–10/mo subscription and the
   ~$3 pay-per-session flow; webhook-driven fulfillment (subscription
   activation, session creation after a one-off payment).
6. **Tipping & ratings** — post-session star rating + optional tip via
   Stripe Checkout, tutor rating aggregate updates automatically.
7. **Tutor payouts** — Stripe Connect Express onboarding; a weekly payout
   job (`src/lib/payouts.ts`) pays out each tutor's tip earnings since
   their last payout via Stripe Transfers.
8. **Admin dashboard** — tutor vetting queue (applied → trial → active →
   suspended/removed) and every metric called out in the spec: async
   response time, live connect time, resolution rate, tutor utilization by
   timezone, live-chat sessions per subscriber, churn, tip volume.
9. **Subject request intake** — picking "Other" on a new question captures
   the requested subject name into `SubjectRequest` for demand tracking.

All of the above was exercised through the actual UI in a browser
(signup → post question → tutor answers → admin approves tutor → tutor
goes available → student hits the subscription/pay-per-session paywall
for live chat), not just typechecked.

## Explicitly stubbed / phase 2

- **B2B licensing** — schema only (`B2BLicense` model). No admin UI to
  create licenses or a redemption flow for students on a licensed seat.
  The spec calls this out as phase 2 once the core platform is stable.
- **Video walkthrough answers** — `Answer.videoUrl` field exists but there's
  no upload/recording UI. Same for full audio/video live chat — the spec
  says text-first is fine for v1.
- **Weekly payout scheduling** — the payout logic itself runs
  (`GET /api/cron/weekly-payouts`, bearer-protected via `CRON_SECRET`), but
  nothing in this environment can register an actual weekly trigger.
  Wire it to Vercel Cron (`vercel.json` `crons` entry) or a GitHub Actions
  scheduled workflow that hits that endpoint.
- **Revenue split for subscription/pay-per-session tutor pay** — payouts
  currently only cover tips, because splitting subscription/session
  revenue across the tutors who actually worked those hours is a real
  unit-economics decision, not an engineering default. The spec's "unit
  economics note" flags this explicitly: model tutor pay against real
  average usage before picking a formula. The admin dashboard's
  "live chat sessions / subscriber" tile exists specifically to give that
  decision real data.
- **File storage** — photo uploads (question attachments) write to
  `public/uploads` on local disk. That's fine for local dev; it will not
  persist across deploys on most hosting platforms. Swap
  `src/lib/uploads.ts` for S3/Cloudinary/R2 before shipping.
- **Rate limiting / abuse prevention** — none. Community Q&A and live chat
  have no spam or abuse controls beyond auth. Worth adding before a public
  launch given the "no gatekeeping" free tier is an easy target.
- **Terms of Service / academic integrity language** — not drafted. The
  spec calls out that this needs legal review before launch.

## Assumptions made (per the spec's "open items")

- **Stripe** for payments, **Stripe Connect (Express)** for tutor payouts —
  both explicitly assumed in the spec.
- Subscription price defaults to **$7/mo** if `STRIPE_SUBSCRIPTION_PRICE_ID`
  isn't set (Checkout falls back to inline `price_data`); pay-per-session
  defaults to **$3**. Set real Stripe Price IDs in production instead of
  relying on the inline fallback.
- Platform cut on tips defaults to **0%** ("none early on, to build trust")
  — see `Tip.platformCutCents` in the schema if/when that changes.
- Tutor vetting is admin-driven manually (no automated subject quiz) —
  the spec mentions "subject quiz or trial period" as the mechanism but
  doesn't specify implementation; this build gives admins a manual
  APPLIED → TRIAL → ACTIVE pipeline to run that process through.

## Running locally

```bash
cp .env.example .env   # fill in Stripe test keys if you want payment flows to work
npm install
npx prisma db push     # or `npx prisma migrate dev` once you want real migrations
npm run db:seed        # creates an admin account — see output for credentials
npm run dev
```

There's no self-serve admin signup by design (`npm run db:seed`, or set
`ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars before running it).

### Stripe setup for local testing

1. Create a Stripe account in test mode, grab the secret key into
   `STRIPE_SECRET_KEY`.
2. `stripe listen --forward-to localhost:3000/api/stripe/webhook` and copy
   the printed webhook secret into `STRIPE_WEBHOOK_SECRET`.
3. Optionally create real Prices in the Stripe dashboard and set
   `STRIPE_SUBSCRIPTION_PRICE_ID` / `STRIPE_PAY_PER_SESSION_PRICE_ID` — if
   left blank the app creates inline one-off prices instead.
4. For Connect payouts, enable Connect in test mode; the onboarding flow
   at `/account/payouts` creates Express accounts automatically.

### Weekly payouts

`GET /api/cron/weekly-payouts` with header
`Authorization: Bearer $CRON_SECRET` runs the payout job. Point a
scheduler at it (Vercel Cron, GitHub Actions `schedule:`, etc) — weekly,
per the spec's "weekly payouts, not net-30" requirement.
