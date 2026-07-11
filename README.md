# TutorApp

> **Also in this repo:** [`hairiq/`](./hairiq/README.md) — a standalone
> quiz-based hair-care routine app (working title "HairIQ"). It has its own
> `package.json` and runs independently of TutorApp.

An affordable, live, global tutoring platform — the Chegg alternative for
students who get stuck at 3 AM and need a real person, not a paywall.
Homework answers are free to read and asking is uncapped; live tutor chat
is unlocked by a $5/mo (or $50/yr) subscription or a ~$3 one-off session. See `BUILD_PLAN.md` for the
full status of what's built vs. stubbed, and the assumptions behind it.

## Stack

Next.js 16 (App Router + Server Actions) · TypeScript · Tailwind CSS 4 ·
Prisma 7 + PostgreSQL · Auth.js v5 (+ TOTP 2FA) · Stripe (Checkout, Billing
Portal, Connect) · Resend (email) · Anthropic Claude API (verified-answer
synthesis)

## Quick start

```bash
cp .env.example .env      # fill in DATABASE_URL, Stripe/Resend keys
npm install
npx prisma db push        # sync the schema to your database
npm run db:seed           # creates the first admin account
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up as a student
to post community questions, or as a tutor to answer them — an admin (from
`db:seed`) has to move a tutor from "applied" to "active" at `/admin/tutors`
before they can go live for chat. New accounts need to verify their email
before posting or chatting; without `RESEND_API_KEY` set, the verification
link is logged to the server console instead of emailed.

## Project layout

- `prisma/schema.prisma` — full data model (users, questions/answers, chat
  sessions, notifications, subscriptions, payments, tips, payouts, B2B
  licenses)
- `src/app` — routes, grouped by feature (`questions`, `chat`, `tutor`,
  `admin`, `account`, `verify-email`)
- `src/actions` — Server Actions (mutations)
- `src/lib` — Prisma client, Stripe client, email, TOTP, tutor notification
  routing, tutor standing, metrics, payouts, uploads, Claude API (answer
  synthesis)

Full build status, what's stubbed for phase 2, and setup notes for Stripe
and the cron jobs are in [`BUILD_PLAN.md`](./BUILD_PLAN.md). Staging
deployment (Railway) is documented in [`DEPLOY.md`](./DEPLOY.md).

---

## OWNER'S MANUAL (no coding required)

Everything below happens in a web browser — the admin dashboard on the live
site, or the Railway dashboard for keys. The app deploys itself: **any
change merged to `main` on GitHub goes live automatically** on Railway.

### a) Manually verify a user (until real emails are on)

New users must verify their email before posting or chatting. Without an
email key, they can't self-verify — so you do it for them:

1. Log in as admin → **Admin** in the nav.
2. The **"Unverified accounts"** box at the top lists everyone waiting.
3. Either click **Verify now** (instant), or copy their personal
   verification link from the box and text/DM it to them to click
   themselves. **Resend email** generates a fresh link if theirs expired.

### b) Load seed questions (build the answer bank)

1. Admin dashboard → **Library Builder** button.
2. Paste questions in the big box, one per line:
   `SUBJECT | title | question text | textbook (optional) | course (optional)`
   Example: `MATH | Solve 2x+6=14 | Show each step. | | Algebra 1`
3. Click **Load into queue**. Tutors see them on their Tutor Hub under
   "Library building" and answer them like normal questions.
4. The progress table on the same page shows loaded / claimed / answered /
   verified counts per subject. Students never see a seed question until
   it's answered.

### c) Approve tutors

1. Admin dashboard → **Tutor vetting queue**.
2. New tutor applications arrive as APPLIED. Move promising ones to
   **TRIAL** (they can answer, marked as in trial) or straight to
   **ACTIVE** (fully live, can take paid chats). SUSPENDED/REMOVED for
   problems.

### d) Read the admin dashboard

Top to bottom: unverified accounts (your to-do), open tutor disagreements
(informational — tutors resolve these themselves by consensus), the metric
tiles (response times, subscribers, effective tutor pay, churn, tips),
requested subjects (what students want that we don't offer — your roadmap
signal), timezone coverage, and the tutor pipeline.

### e) Turn on real email later (Resend)

1. Get a free key at **resend.com** → sign up → API Keys → Create.
2. Go to **railway.app** → your `tutorapp` project → click the **web**
   service → **Variables** tab.
3. Find `RESEND_API_KEY`, paste the key as its value (or add the variable
   if it's not there), save. Railway redeploys itself.
4. Done — verification emails, dispute notices, and contact-form messages
   start sending for real. No code changes.

### f) Turn on real payments later (Stripe)

1. In the Stripe dashboard (test mode first!), copy the **secret key**
   (`sk_test_...`) and **publishable key** (`pk_test_...`).
2. Railway → web service → Variables: set `STRIPE_SECRET_KEY` and
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Also set `STRIPE_SECRET_KEY` on
   the **cron-worker** service (it pays tutors weekly).
3. In Stripe: Developers → Webhooks → Add endpoint →
   `https://web-production-c1fa4.up.railway.app/api/stripe/webhook` with
   events `checkout.session.completed`, `invoice.paid`, `account.updated`.
   Copy the signing secret into `STRIPE_WEBHOOK_SECRET` on Railway.
4. Subscriptions ($5/mo, $50/yr) and $3 sessions use built-in prices
   automatically; create real Prices in Stripe later if you want, and put
   their IDs in `STRIPE_SUBSCRIPTION_PRICE_ID`,
   `STRIPE_SUBSCRIPTION_YEARLY_PRICE_ID`, `STRIPE_PAY_PER_SESSION_PRICE_ID`.
5. Going live for real money = same steps with live-mode keys.

### Everyday reminders

- **Photos don't persist yet** — uploaded photos vanish on redeploys until
  storage moves to S3/R2. Tell testers.
- The **cron worker** runs by itself (delay notices every 5 min, tutor
  payouts Mondays). Nothing to do.
- Your admin login is the `ADMIN_EMAIL` / `ADMIN_PASSWORD` set in Railway
  variables.
