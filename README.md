# ScholarMatch

A scholarship and grant matching and completion platform for college-bound
high school seniors through grad students and adult learners, anywhere in
the world: it matches students to aid they actually qualify for, and walks
each application through to submission instead of stopping at discovery.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Prisma + PostgreSQL
- Auth.js (NextAuth v5) — Google OAuth + email magic link
- react-hook-form + zod for the intake form

## Local development

1. Start Postgres (either `docker compose up -d`, or a local install) and set
   `DATABASE_URL` in `.env` (copy `.env.example`).
2. Copy `.env.example` to `.env` and fill in `AUTH_SECRET` (`npx auth secret`)
   and Google OAuth credentials (`AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` from
   the Google Cloud Console — redirect URI
   `http://localhost:3000/api/auth/callback/google`).
3. Install dependencies and sync the schema:

   ```bash
   npm install
   npx prisma db push
   npm run db:seed
   ```

4. Run the app:

   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000/login` to sign in (Google or email magic
   link — without `RESEND_API_KEY` set, the magic link is printed to the
   server console instead of emailed) and complete the intake form.

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

## Authentication

Google OAuth is the primary sign-in path — it ties an account to an
already-verified real identity with no extra fraud-detection work. Email
magic-link sign-in is also available for students without/who prefer not to
use a Google account; clicking the link is itself the email verification
step (`emailVerified` is set the moment they complete it). There is no
password-based sign-in and no anonymous/guest profile — every account is a
real, verified identity, which is also the foundation the future paid tier
(see below) will need for billing. See `src/auth.ts`.

## Global by default

Students set a home country and a (possibly different) country of study.
Scholarships carry two independent country filters, matched against the
matching engine's benefit-of-the-doubt hard filters:

- `eligibleCountries` — where the award can be **used** (country of study),
  e.g. DAAD only funds study in Germany.
- `homeCountryEligibility` — who's eligible to **apply**, by nationality/
  residency, e.g. Fulbright/Boren require U.S. citizenship but send
  students to study in many different countries.

Both default to `["United States"]` for the original domestic scholarship
batch and are overridden per-entry for global programs — see the provenance
notes at the top of `prisma/seed.ts` for which of the two are enforced vs.
left open where I didn't have a confident enough country list (e.g.
Chevening's and Australia Awards' specific eligible-country lists aren't
asserted, since guessing them would be worse than leaving them unfiltered).
Award amounts carry their own `currencyCode`, and the dashboard totals
eligible amounts per currency rather than pretending USD + EUR + GBP can be
summed into one number.

## Notification pipeline

`POST /api/cron/notifications` runs one sweep: deadline reminders at 30/14/3
days out, a day-after "did you submit?" nudge, and renewal reminders 60 days
before a renewable award's next anniversary. It's meant to be hit by an
external scheduler roughly once a day, authenticated with a bearer token
matching `CRON_SECRET`. `vercel.json` wires this up for Vercel Cron (which
auto-sends that header when `CRON_SECRET` is set as a project env var); swap
in GitHub Actions or another scheduler if not deploying to Vercel.

## Payment system — spec only, not built

Documented here for future planning; no billing code exists yet, and none
should be built until the free core product and verified-account system
above are solid. This needs its own dedicated planning pass before it
becomes a build task — the outline below is a placeholder, not a spec to
implement from.

- **Free tier**: full core functionality — matching, search, the guided
  walkthrough, status tracking, notifications — stays completely free, with
  no artificial credit limits or paywalls on basic use.
- **Paid tier**: a low-cost monthly subscription (~$2–3/mo) or annual pass
  (~$10–15/yr), not per-action microtransactions (payment processor fees
  make sub-$1 charges impractical at this price point).
- **Paid features add real value, never shortcuts that undermine the
  platform's integrity**: advanced filters/saved searches, priority
  notification timing, personal application analytics (e.g. how a profile
  compares to other matched students), early access to newly added
  scholarships/grants before free users see them, and eventually a
  human-reviewed essay/script feedback marketplace with real reviewers —
  not AI-generated feedback.
- Verified accounts (Google OAuth / confirmed email, see Authentication
  above) are a prerequisite for this, since billing requires knowing a
  subscriber is a real, single person.

## Roadmap (explicitly not in v1)

- Chrome extension (surface a school's active scholarships/deadlines when
  visiting that school's site) and a one-click "Add to Library" save button
  tied to it. `Scholarship.schoolName` already exists so this doesn't need
  a future schema migration, but no extension code exists yet.
- Essay bank/library, FAFSA/CSS Profile sync, document vault,
  counselor/parent view, outcome data feedback loop.
- Essay authenticity tracking: when this is eventually built, it should be
  a **process-integrity** layer — timestamped draft history, revision
  tracking, time-on-task signals — not AI-text detection on the final essay.
  Detectors are unreliable in practice and produce real false positives,
  which would wrongly penalize genuine, fluent writers. Nothing related to
  this should be built until that's the explicit spec.
- The payment system above.
