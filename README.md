# ScholarMatch

A scholarship and grant matching and completion platform for college-bound
high school seniors through grad students and adult learners, anywhere in
the world: it matches students to aid they actually qualify for, and walks
each application through to submission instead of stopping at discovery.

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
  notifications, and application_steps tables, plus the shared
  demographic/eligibility taxonomy. Deadlines and other timestamps are
  stored as `timestamptz` (UTC internally).
- `prisma/seed.ts` — curated starter scholarship + grant listings (US and
  global), with provenance/confidence notes at the top of the file.
- `src/lib/matching.ts` — hard-filter (GPA, state, major, country of study)
  + demographic-overlap scoring engine.
- `src/lib/taxonomy.ts` / `src/lib/countries.ts` — demographic tag groups,
  income brackets, award types, and country list used by both the intake
  form and scholarship seed data.
- `src/lib/steps.ts` — generates the guided application walkthrough steps
  for a match from the scholarship's requirements.
- `src/components/local-date.tsx` — client-side date/countdown rendering in
  the browser's own timezone (auto-detected, no manual picker anywhere).
- `src/app/profile` — student intake form.
- `src/app/dashboard` — matches, dollar-value hook (grouped by currency),
  award-type/quick-win/category filters, status tracker.
- `src/app/dashboard/matches/[id]` — guided, step-by-step application
  walkthrough; opening it moves a match from Not Started to In Progress,
  completing the final step moves it to Submitted.
- `src/lib/notifications` — SMS (Twilio)/email (Resend) senders and the
  deadline/renewal reminder sweep, localized to each student's stored
  timezone. Without API keys set, sends are logged instead of attempted,
  so the pipeline runs end-to-end in local dev.

## Global by default

Students set a home country and a (possibly different) country of study;
scholarships can restrict by country of study, describe a region for
context (e.g. "Commonwealth"), and carry their own currency. The dashboard
totals eligible amounts per currency rather than pretending USD + EUR + GBP
can be summed into one number. Known gap: the matching engine filters by
country of study, not applicant home-country eligibility (relevant to a
few of the seeded global fellowships) — noted in `prisma/seed.ts`.

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
