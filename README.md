# ScholarMatch

A scholarship matching and completion platform: it matches college students to
scholarships they actually qualify for, and tracks each application through to
submission instead of stopping at discovery.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Prisma + PostgreSQL
- react-hook-form + zod for the intake form

## Local development

1. Start Postgres (either `docker compose up -d`, or a local install) and set
   `DATABASE_URL` in `.env` (copy `.env.example`).
2. Install dependencies and sync the schema:

   ```bash
   npm install
   npx prisma db push
   npm run db:seed
   ```

3. Run the app:

   ```bash
   npm run dev
   ```

4. Visit `http://localhost:3000/profile` to fill out the student intake form.

## Project layout

- `prisma/schema.prisma` — students, scholarships, matches, documents,
  notifications tables and the shared demographic/eligibility taxonomy.
- `prisma/seed.ts` — curated starter scholarship listings.
- `src/lib/matching.ts` — hard-filter + demographic-overlap matching engine.
- `src/lib/taxonomy.ts` — demographic tag groups, income brackets, etc. used
  by both the intake form and scholarship seed data.
- `src/app/profile` — student intake form.
- `src/app/dashboard` — matches, dollar-value hook, status tracker.
- `src/lib/notifications` — SMS (Twilio)/email (Resend) senders and the
  deadline/renewal reminder sweep. Without API keys set, sends are logged
  instead of attempted, so the pipeline runs end-to-end in local dev.

## Notification pipeline

`POST /api/cron/notifications` runs one sweep: deadline reminders at 30/14/3
days out, a day-after "did you submit?" nudge, and renewal reminders 60 days
before a renewable award's next anniversary. It's meant to be hit by an
external scheduler roughly once a day, authenticated with a bearer token
matching `CRON_SECRET`. `vercel.json` wires this up for Vercel Cron (which
auto-sends that header when `CRON_SECRET` is set as a project env var); swap
in GitHub Actions or another scheduler if not deploying to Vercel.

## Roadmap (explicitly not in v1)

Essay bank/library, FAFSA/CSS Profile sync, document vault, counselor/parent
view, outcome data feedback loop, and essay authenticity tracking are phase 2.
