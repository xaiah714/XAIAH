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
      tutor pool, distributed proportional to *every* tutor's share of
      subscription-funded live-chat minutes served that period — whether or
      not their Connect account is ready yet.
    - Pay-per-session pays 75% direct to the tutor who handled it; tips
      pass through at 100% by default (`platformCutCents` is 0).
    - **Held payouts**: a tutor without a ready Stripe Connect account
      still earns their share — it's created as a `HELD` payout instead of
      being dropped or silently redistributed. Held funds carry a 30-day
      `holdExpiresAt`; the tutor gets a `PAYOUT_HELD` notification
      immediately, a `PAYOUT_REMINDER` about a week before the deadline,
      and either a `PAYOUT_RELEASED` notification (paid automatically the
      moment their Connect account becomes ready — see the
      `account.updated` webhook handler) or a `PAYOUT_EXPIRED` one if the
      30 days lapse first. Expired amounts roll back into the *next* run's
      pool rather than becoming platform breakage. None of this is a
      silent forfeiture — every state transition sends a notification, and
      `/account/payouts` shows a "held for you" banner with the countdown.
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
14. **Answer quality control** — repositioning the product around "every
    answer is verified":
    - `Answer.reasoning` is a required field on the schema and in
      `createAnswerAction`/the answer form — an answer can't be submitted
      with only a final result, no steps shown. The question detail page
      renders reasoning and the final answer as clearly separate blocks.
    - A student can optionally attach their class's method/constraints
      (free text + an optional photo of a class example) plus course name
      and textbook/edition when posting a question, so a tutor answers the
      way the student's class is actually taught instead of a technically-
      correct-but-unusable alternate method. Shown as a highlighted "this
      student's class method" card on the question page.
    - A "route to multiple tutors for a second opinion" checkbox
      (`Question.secondOpinionRequested`) — the existing broadcast/claim
      notification model already fans a question out to every available,
      subject-tagged tutor, so this doesn't need new routing; it flags the
      question for the AI synthesis step below.
    - **AI synthesis — PARKED, fully disabled.** `src/lib/ai.ts` (Claude
      API, `claude-fable-5`) is kept in the tree but nothing in the active
      flow imports or calls it, and the active launch flow has zero
      `ANTHROPIC_API_KEY` dependency. Verification badges and dispute
      resolution below are entirely tutor-driven. Re-enable by calling
      `maybeSynthesizeSecondOpinion()` from `createAnswerAction` once a
      key exists and `scripts/test-synthesis.ts` outputs have been
      reviewed. Original design (for when it returns): once a
      `secondOpinionRequested` question has 2+ *verified-tutor* answers and
      no cached synthesis yet, the reasoning+final answer of every verified
      answer is sent to Claude with a system prompt that explicitly forbids
      introducing new problem-solving — it may only reconcile/simplify
      reasoning tutors have already written and had verified. Triggered
      from `createAnswerAction` right after an answer is saved; cached on
      `Question.aiSynthesis`/`aiSynthesizedAt` so it only ever runs once per
      question. Rendered as a clearly-labeled "AI-simplified summary (of
      verified tutor answers)" card, visually distinct from the tutor
      answers themselves. Follows the same dev-safe-fallback pattern as
      Resend/Stripe: without `ANTHROPIC_API_KEY` set, it logs and skips
      rather than failing the answer submission. The system prompt carries
      the platform's mission (student-first, patient-tutor tone, credible
      to education partners) and a hard requirement that every output
      explains *why* the answer is correct simply enough for a third
      grader — not just restates it. `scripts/test-synthesis.ts` runs the
      real function against two sample questions (math + psychology) with
      mock verified answers and prints the full outputs for human tone
      judgment; **pending** — it needs `ANTHROPIC_API_KEY`, which doesn't
      exist in the build environment yet, so the prompt's output quality
      has not been verified against real completions.
    - **Flagging + tutor standing** (`AnswerFlag` model,
      `src/lib/tutor-standing.ts`) — anyone but the answer's author can
      flag a verified answer as incomplete/incorrect from the question
      page. Once a tutor has 5+ verified answers and more than 30% of them
      are flagged, `getSuppressedTutorIds` excludes them from
      `notifyTutorsForSubject`'s broadcasts — they keep their account,
      rating, and existing claimed work, they just stop being routed *new*
      requests until their ratio recovers. This is separate from (and in
      addition to) the star rating, per the spec's requirement that
      low-quality tutors get routed less work, not just rated lower.
15. **Delay notice + second-opinion auto-escalation** — a sweep job
    (`src/lib/question-sweep.ts`, run every 5 minutes via
    `GET /api/cron/question-sweep`, same `CRON_SECRET` bearer pattern as
    the payout cron) so students are never left wondering whether anything
    is happening:
    - **15 minutes unanswered** → a proactive `QUESTION_DELAY_NOTICE`
      notification plus a "Still working on connecting you with a
      verified tutor" banner on the question page (author-only) — this
      deliberately fires before escalation so the student always hears
      something first.
    - **30 minutes unanswered** → the question is automatically flagged
      `secondOpinionRequested` (the exact mechanism behind the manual
      checkbox, just time-triggered), a `QUESTION_ESCALATED` notification
      goes out, and the banner switches to "We've escalated this to
      multiple verified tutors."
    - Each stage records a timestamp on the question
      (`delayNoticeSentAt` / `autoEscalatedAt`) so re-running the sweep
      never double-sends, and questions answered between sweeps drop out
      naturally (their status is no longer `OPEN`).
16. **Agreement badges + dispute review board (zero AI)** — trust comes
    from tutors checking each other, with no API dependency:
    - A verified tutor answering a question that already has a verified
      answer must declare a stance: agree or disagree
      (`Answer.agreesWithPrior`). Tutors can also endorse an existing
      verified answer ("Agree — this answer is correct",
      `AnswerEndorsement`).
    - **Agreement** → a "✓✓ Verified by N tutors" badge on the question
      page and the questions list, where N is the distinct verified
      tutors backing the agreeing side (authors + endorsers,
      2 minimum — `src/lib/consensus.ts`).
    - **Disagreement** → NO badge. The question is marked disputed
      (`Question.disputedAt`) and lands on the subject review board (a
      section on `/tutor` visible to every tutor tagged in that subject).
      Every ACTIVE subject tutor except the disputer gets an in-app
      `DISPUTE_REVIEW` notification AND an email — availability toggle
      and standing don't matter here, the whole subject pool is invited.
      The platform owner simultaneously gets an informational email
      (`ADMIN_ALERT_EMAIL`, console-logged when blank) plus an
      admin-dashboard "open tutor disagreements" flag — the owner always
      knows, but is never required to resolve anything.
    - **Consensus resolves it**: tutors weigh in by endorsing the answer
      they believe is correct (or adding their own). When one answer is
      backed by at least 3 tutors and strictly more than every other, the
      dispute resolves, the winning answer is highlighted as "✓ Consensus
      answer," and the badge appears with the winning side's count.
    - Student-facing copy says "verified tutor," never "expert" — these
      are vetted, skilled tutors and that's the accurate trust label.
17. **Public tutor profiles with split trust signals** — `/tutors/[id]`
    (only for vetted TRIAL/ACTIVE tutors; anything else 404s), linked
    from every place a student encounters a tutor: verified answers on
    question pages (which is also the review-board path) and the live
    chat header. The page enforces a hard visual separation between the
    two kinds of trust signals:
    - **"✓ Verified by TutorApp"** (teal-marked, check markers, "the
      tutor can't edit these"): vetting status, live sessions completed,
      rating average/count, verified-answer count, join date — all
      computed from platform records.
    - **"In their own words"** (plain card, no check marks, explicitly
      labeled "Self-reported by the tutor — not checked or verified"):
      education (school/degree/grad year), background & credentials,
      bio — all optional fields on the existing `/tutor` profile form.
    - **No new contact channel**: no contact-info fields exist in the
      schema, the page shows no email/links/handles and no message
      button, and a footer note tells students the only way to talk to a
      tutor is a platform session — the no-direct-contact architecture is
      untouched.
18. **New-student signup notifications** — students can optionally pick
    the subjects they need help with at signup (`User.studentSubjects`);
    every ACTIVE tutor tagged in one of them gets a `NEW_STUDENT_SIGNUP`
    notification (one per tutor, not per subject). Delivery is instant
    per-signup for now (pre-launch volume); `notifyTutorsOfNewStudent` in
    `src/lib/notify.ts` is the single delivery seam, with a mode constant
    documenting the switch to a daily-digest cron later.
18. **Layered signup email validation** — strict format, typo-TLD/typo-
    domain rejection (.con, gmial.com, ...), a disposable-provider
    blocklist, and a DNS MX check that fails open on infrastructure
    errors but closed on "domain doesn't exist" (`src/lib/
    email-validation.ts`), all behind a clear "Please use a real email
    address" message. No live inbox-existence checking (mail servers
    don't reveal it) — the backstop is the verification gate: posting,
    answering, and chat pages and their actions all require a verified
    email, so an account on a fake inbox can't do anything anyway.
19. **Product-first homepage** — search-first hero ("Find your
    question") wired to the answer bank, subject navigation chips,
    action cards, a live "Recently answered" strip with verification
    badges, condensed how-it-works, and pricing kept but moved below the
    fold. One primary action, ADHD-friendly.
20. **Persistent live-chat launcher** — floating bottom-right button on
    every page (hidden only inside an active chat room so it can't cover
    the composer): signed-out → sign-in, student → straight into the
    live-chat request flow, tutor → the queue.
21. **"Other" subject at signup** — free-text subject requests flow into
    `SubjectRequest` and surface on the admin dashboard as a "Requested
    subjects (demand signal)" list alongside the ones captured from
    question posting.
22. **Searchable answer bank** — `/questions` has a search box (`?q=`)
    that matches against title/body/course/textbook and, when a query is
    present, surfaces questions with more answers first. The "ask a
    question" form also does a debounced (400ms) live lookup against
    `GET /api/questions/search` (answered/resolved questions only) and
    shows matches inline as "Already answered — check these first," so a
    duplicate question can be avoided before it's ever posted.

All of the above was exercised through the actual UI in a browser, not just
typechecked, including: signup with grade level → blocked from posting pre-
verification → unblocked after clicking the (console-logged) verification
link → tutor approved by admin → tutor sets subjects and goes available →
student posts a question → tutor sees an anonymized notification with grade
level (not name) → tutor claims a live chat request → chat becomes active
and messages send → 2FA setup → login correctly requires the code and
rejects a wrong one before accepting the right one. For this round
specifically: a student posted a question with class-method notes, course
name, and "second opinion" checked → the method context and second-opinion
badge rendered on the question page → two different verified tutors each
submitted a reasoning+final-answer pair → the AI synthesis step ran and
correctly no-op'd with a console log (no `ANTHROPIC_API_KEY` in this
environment) instead of erroring → the student flagged one tutor's answer
and saw it register → the posted question was found via `/questions?q=...`
search. Separately, a direct Prisma script pushed one tutor to 6 verified
answers/3 flags (50%) and another to 6 verified answers/1 flag (~17%) and
confirmed `notifyTutorsForSubject` broadcasts a new question to the
under-threshold tutor but skips the over-threshold one.

## Explicitly stubbed / phase 2

- **B2B licensing** — schema only (`B2BLicense` model). No admin UI to
  create licenses or a redemption flow for students on a licensed seat.
  The spec calls this out as phase 2 once the core platform is stable.
- **Video walkthrough answers** — `Answer.videoUrl` field exists but there's
  no upload/recording UI. Same for full audio/video live chat — the spec
  says text-first is fine for v1.
- **Cron scheduling** — `scripts/cron-worker.ts` is a long-running
  scheduler deployed as a second Railway service (weekly payouts Mondays
  12:00 UTC with a double-run database guard, question sweep every 5
  minutes); it calls the job functions directly against the database. The
  bearer-protected HTTP routes (`/api/cron/*`) remain for manual triggers
  — see DEPLOY.md.
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
- **Photo-to-search** (reverse image lookup for "has this exact problem
  already been answered?") — not built this round. The text-based search
  bank (title/body/course/textbook) is; a vision-based version needs its
  own design pass (what counts as a "match," how to handle a partially-
  matching photo) rather than being bolted onto the text search endpoint.
- **Practice problems library, study guides, flashcards, step-by-step math
  solver** — all explicitly Phase 2 per the spec's own roadmap ("once core
  loop is proven"); not started.

## Assumptions made (per the spec's "open items")

- **Stripe** for payments, **Stripe Connect (Express)** for tutor payouts,
  running the 50/50 pooled subscription split — all explicitly specified.
- **Payout rail**: Stripe Connect Express is the only payout system — no
  second processor (e.g. Mercury) integrated. Express accounts aren't
  created with a hardcoded country, so Stripe's hosted onboarding
  (`account_onboarding` link in `src/actions/connect.ts`) collects the
  tutor's country and bank details itself and routes payouts over whatever
  local rail applies automatically (ACH for US tutors, SEPA/local transfer
  for supported countries elsewhere) — this requires no branching in this
  codebase. Revisit only if a specific country in the tutor base falls
  outside [Stripe Connect's supported regions](https://stripe.com/global).
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
- **Anthropic Claude API — `claude-fable-5`** for the answer-synthesis
  step. This is a deliberate quality-over-cost choice: Fable 5 costs more
  per call than Sonnet or Opus ($10/$50 per 1M input/output tokens vs.
  $5/$25 for Opus 4.8), accepted for this feature because the synthesis
  card is a student-facing quality signal and runs at most once per
  question. Two Fable-specific behaviors are handled in `src/lib/ai.ts`:
  thinking is always on (configured as `adaptive`, the only accepted
  form), and its safety layer can occasionally decline benign academic
  content — so every request carries a server-side fallback to
  `claude-opus-4-8` (`server-side-fallback-2026-06-01` beta): if Fable
  declines, Opus re-serves the same request inside the same call, and only
  if the whole chain declines does the question simply go without a
  synthesis card. Same dev-safe fallback as Resend/Stripe: without
  `ANTHROPIC_API_KEY` set, it logs and skips instead of failing the
  answer submission.
- Tutor-standing suppression threshold (5+ verified answers, >30% flagged)
  is a starting number, not from the spec — it only needed to be "more
  than one bad answer" and "not so aggressive a single flag buries someone
  new." Tune `src/lib/tutor-standing.ts` once real flag data exists.

## Deploying to staging

See [`DEPLOY.md`](./DEPLOY.md) — the target is **Railway**, hosting the
web app, the Postgres database, and a cron-worker service together in one
project. Schema sync (`prisma db push`) and admin seeding run
automatically on every deploy via `npm run start:railway`, so setup is
entirely dashboard clicks — DEPLOY.md walks through them step by step for
a first-time Railway user. The pipeline is ready to receive real Stripe
test-mode keys and a Resend key whenever they're available: every
integration degrades gracefully while its key is blank, so deploy first,
add keys later. The initial repo import needs your Railway account, so
that one-time step is yours.

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

### AI answer synthesis without a real provider

Leave `ANTHROPIC_API_KEY` blank and the synthesis step logs a skip notice
to the server console instead of calling Claude — the rest of the answer
flow (reasoning + final answer, flags, second-opinion routing) works fully
without it; you just won't see the "AI-simplified summary" card appear.

### Stripe setup for local testing

1. Create a Stripe account in test mode, grab the secret key into
   `STRIPE_SECRET_KEY`.
2. `stripe listen --forward-to localhost:3000/api/stripe/webhook` and copy
   the printed webhook secret into `STRIPE_WEBHOOK_SECRET`. Make sure
   `invoice.paid` (tutor payout pool revenue) and `account.updated` (releases
   held payouts the moment a tutor finishes Connect onboarding) are included,
   not just `checkout.session.completed`.
3. Optionally create real Prices in the Stripe dashboard and set
   `STRIPE_SUBSCRIPTION_PRICE_ID` / `STRIPE_PAY_PER_SESSION_PRICE_ID` — if
   left blank the app creates inline one-off prices instead.
4. For Connect payouts, enable Connect in test mode; the onboarding flow
   at `/account/payouts` creates Express accounts automatically.

### Weekly payouts

In deployment the cron-worker service runs this automatically (Mondays
12:00 UTC — see DEPLOY.md). For a manual run locally or in staging:
`GET /api/cron/weekly-payouts` with header
`Authorization: Bearer $CRON_SECRET` — weekly, per the spec's "weekly
payouts, not net-30" requirement.
