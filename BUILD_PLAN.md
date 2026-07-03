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
- **Auth.js (NextAuth) v5**, credentials provider (+ TOTP 2FA), JWT sessions
- **Stripe** — Checkout for subscriptions and pay-per-session, Billing
  Portal, Connect Express for tutor payouts
- **Resend** for transactional email (verification links), with a
  console-log fallback when no API key is set

Prisma schema: `prisma/schema.prisma`. It models every entity from the
spec: users (student/tutor/admin with subjects, timezone, gender, rating,
grade level), questions/answers, chat sessions/messages, notifications,
subscriptions, subscription invoices, payments, tips, ratings, payouts, and
a phase-2 `B2BLicense` table.

## What's built and working end-to-end

1. **Auth + profiles** — signup (student or tutor, with grade level for
   students), login, role-gated pages, profile editing.
2. **Email verification** — signup sends a confirmation link (Resend, or
   logged to the server console in dev); posting questions, answering,
   starting/claiming live chat, and going available as a tutor are all
   gated behind a verified email (`requireVerifiedUser` in
   `src/lib/auth-helpers.ts`). Browsing community Q&A stays open either way.
3. **Two-factor auth (TOTP)** — `/account/security` lets any account turn on
   an authenticator-app-based 2FA (RFC 6238, implemented directly on
   `node:crypto`, no extra crypto dependency). Login becomes a two-step
   challenge (password, then code) when enabled — see
   `src/auth.ts`/`src/actions/auth.ts` for the `TwoFactorRequiredError` /
   `TwoFactorInvalidError` flow. The setup secret is persisted as "pending"
   the moment setup starts, so the QR code you scan can't drift out of sync
   with what a stale page render would otherwise regenerate.
4. **Community Q&A** — post a question with an optional photo, browse by
   subject, answer, mark resolved. Always free, no auth required to browse.
5. **Async tutor answers** — tutors get a subject-filtered "batch mode"
   queue of unanswered questions; their answers carry a verified-tutor
   badge distinct from community answers.
6. **Notification + claim-only routing** — posting a question or starting a
   live chat never silently assigns a tutor. Every available, subject-tagged
   tutor gets an in-app `Notification` (bell badge in the nav, feed on
   `/tutor`) showing only the subject and the student's grade level — never
   a name or contact info pre-claim. Tutors claim from their own queue;
   there's no persistent tutor↔student channel outside of a claimed,
   session-scoped chat thread, and it's structural (no DM table exists),
   not a policy tutors have to follow. See `src/lib/notify.ts`.
7. **Live chat** — subject-based matching against tutors who've toggled
   themselves available (this is the timezone-arbitrage mechanism in
   practice: a tutor only shows as available when they're actually awake).
   Polling-based chat UI (2.5s), not WebSockets — fine for v1 traffic, worth
   revisiting if concurrent session volume gets heavy.
8. **Payments** — Stripe Checkout for the $5–10/mo subscription and the
   ~$3 pay-per-session flow; webhook-driven fulfillment.
9. **Tipping & ratings** — post-session star rating + optional tip via
   Stripe Checkout, tutor rating aggregate updates automatically.
10. **Tutor payouts with the spec's actual split** — weekly payout job
    (`src/lib/payouts.ts`, triggered via `GET /api/cron/weekly-payouts`):
    - Subscription revenue is pooled (tracked per-invoice via the
      `invoice.paid` webhook into `SubscriptionInvoice`) and split 50% to a
      tutor pool, distributed proportional to each ready tutor's share of
      subscription-funded live-chat minutes served that period.
    - Pay-per-session pays 75% direct to the tutor who handled it.
    - Tips pass through at 100% by default (`platformCutCents` is 0).
    - Payout records break down `poolCents` / `directCents` / `tipCents`
      for tutor-facing transparency on `/account/payouts`.
    - The admin dashboard's "Effective tutor pay (pool)" tile computes the
      actual $/hr the pool works out to, against the spec's ~$7.50/hr
      reference point, so the split can be monitored and revisited early.
11. **Admin dashboard** — tutor vetting queue (applied → trial → active →
    suspended/removed) and every metric called out in the spec.
12. **Subject request intake** — picking "Other" on a new question captures
    the requested subject name into `SubjectRequest`.
13. **Mobile nav** — the header collapses into a hamburger menu below the
    `sm` breakpoint; the rest of the UI was already responsive (single
    primary action per screen, fluid Tailwind layouts).

All of the above was exercised through the actual UI in a browser, not just
typechecked, including: signup with grade level → blocked from posting pre-
verification → unblocked after clicking the (console-logged) verification
link → tutor approved by admin → tutor sets subjects and goes available →
student posts a question → tutor sees an anonymized notification with grade
level (not name) → tutor claims a live chat request → chat becomes active
and messages send → 2FA setup → login correctly requires the code and
rejects a wrong one before accepting the right one.

## Explicitly stubbed / phase 2

- **B2B licensing** — schema only (`B2BLicense` model). No admin UI to
  create licenses or a redemption flow for students on a licensed seat.
  The spec calls this out as phase 2 once the core platform is stable.
- **Video walkthrough answers** — `Answer.videoUrl` field exists but there's
  no upload/recording UI. Same for full audio/video live chat — the spec
  says text-first is fine for v1.
- **Weekly payout scheduling** — the payout logic itself runs, but nothing
  in this environment can register an actual weekly trigger. Wire
  `GET /api/cron/weekly-payouts` (bearer-protected via `CRON_SECRET`) to
  Vercel Cron (`vercel.json` `crons` entry) or a GitHub Actions scheduled
  workflow.
- **Pool payout limitation** — only tutors with a *ready* Stripe Connect
  account at run time are included in a given week's pool distribution
  (their minutes are excluded from the denominator too, so it redistributes
  rather than "losing" the money, but a tutor who connects payouts late
  misses that week's pool share retroactively). Worth revisiting with a
  proper accrual ledger if this becomes a real complaint.
- **File storage** — photo uploads write to `public/uploads` on local disk.
  Fine for local dev; won't persist across deploys on most hosting
  platforms. Swap `src/lib/uploads.ts` for S3/Cloudinary/R2 before shipping.
- **Rate limiting / abuse prevention** — none. Community Q&A and live chat
  have no spam or abuse controls beyond auth. Worth adding before a public
  launch given the "no gatekeeping" free tier is an easy target.
- **Terms of Service / academic integrity + contractor classification
  language** — not drafted. The spec explicitly flags both as needing legal
  review before launch (the payout split is structured to *support* a
  contractor classification argument — flexible claiming, no exclusivity,
  no mandatory hours — but that's a legal conclusion, not something this
  build can certify).
- **Native/wrapped mobile app** — the spec asks for a responsive web app
  first, then a native/wrapped layer on top "without cutting features for
  mobile." Only the responsive web app is built; no native wrapper.

## Assumptions made (per the spec's "open items")

- **Stripe** for payments, **Stripe Connect (Express)** for tutor payouts,
  running the 50/50 pooled subscription split — all explicitly specified.
- **Resend** for verification email, un-specified in the spec — swap
  `src/lib/email.ts` for another provider if preferred. Without
  `RESEND_API_KEY` set, emails are logged to the server console instead of
  failing, so the verification flow is testable without a live account.
- **TOTP (authenticator app) for 2FA**, not SMS — the spec says "available
  or required," this build makes it available (opt-in) for both roles
  rather than mandatory, since forcing it changes onboarding friction in a
  way the spec doesn't explicitly ask for.
- Subscription price defaults to **$7/mo** if `STRIPE_SUBSCRIPTION_PRICE_ID`
  isn't set (Checkout falls back to inline `price_data`); pay-per-session
  defaults to **$3**. Set real Stripe Price IDs in production.
- Tutor vetting is admin-driven manually (no automated subject quiz) — the
  spec mentions "subject quiz or trial period" as the mechanism but doesn't
  specify implementation; admins run a manual APPLIED → TRIAL → ACTIVE
  pipeline instead.
- Grade level lives on the student's profile (set at signup, editable in
  account settings), not per-question — a student's grade level doesn't
  usually change question-to-question, and this keeps the "ask a question"
  form to its minimal-fields ADHD-friendly design.

## Running locally

```bash
cp .env.example .env   # fill in Stripe/Resend test keys if you want those flows fully live
npm install
npx prisma db push     # or `npx prisma migrate dev` once you want real migrations
npm run db:seed        # creates an admin account — see output for credentials
npm run dev
```

There's no self-serve admin signup by design (`npm run db:seed`, or set
`ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars before running it).

### Email verification without a real provider

Leave `RESEND_API_KEY` blank and verification emails are written to the
server's stdout instead of sent — copy the `/verify-email/<token>` link
from the terminal to complete signup during local development.

### Stripe setup for local testing

1. Create a Stripe account in test mode, grab the secret key into
   `STRIPE_SECRET_KEY`.
2. `stripe listen --forward-to localhost:3000/api/stripe/webhook` and copy
   the printed webhook secret into `STRIPE_WEBHOOK_SECRET`. Make sure
   `invoice.paid` is included (needed for the tutor payout pool
   calculation, not just `checkout.session.completed`).
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
