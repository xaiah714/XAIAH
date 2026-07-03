# TutorApp

An affordable, live, global tutoring platform — the Chegg alternative for
students who get stuck at 3 AM and need a real person, not a paywall.
Community Q&A is free and uncapped; live tutor chat is unlocked by a
$5–10/mo subscription or a ~$3 one-off session. See `BUILD_PLAN.md` for the
full status of what's built vs. stubbed, and the assumptions behind it.

## Stack

Next.js 16 (App Router + Server Actions) · TypeScript · Tailwind CSS 4 ·
Prisma 7 + PostgreSQL · Auth.js v5 · Stripe (Checkout, Billing Portal,
Connect)

## Quick start

```bash
cp .env.example .env      # fill in DATABASE_URL and Stripe keys
npm install
npx prisma db push        # sync the schema to your database
npm run db:seed           # creates the first admin account
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up as a student
to post community questions, or as a tutor to answer them — an admin (from
`db:seed`) has to move a tutor from "applied" to "active" at `/admin/tutors`
before they can go live for chat.

## Project layout

- `prisma/schema.prisma` — full data model (users, questions/answers, chat
  sessions, subscriptions, payments, tips, payouts, B2B licenses)
- `src/app` — routes, grouped by feature (`questions`, `chat`, `tutor`,
  `admin`, `account`)
- `src/actions` — Server Actions (mutations)
- `src/lib` — Prisma client, Stripe client, tutor matching, metrics, uploads

Full build status, what's stubbed for phase 2, and setup notes for Stripe
and the weekly payout cron are in [`BUILD_PLAN.md`](./BUILD_PLAN.md).
