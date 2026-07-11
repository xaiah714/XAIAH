# HairIQ (working title)

A quiz-based hair-care tool: 10 questions in, a personalized routine out —
with product picks across three lenses (**Drugstore | Luxury | Vegan &
Cruelty-Free**), all pre-calculated so switching tabs is instant.

**v1 scope:** no login, no email capture, no database. Pure quiz → results,
all state client-side (React context + a sessionStorage mirror so refreshes
don't lose progress).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
```

## Where things live

| What | Where |
|---|---|
| App name / tagline / disclaimer | `src/lib/branding.ts` — change `APP_NAME` once when the real name is picked |
| Quiz questions & options | `src/lib/quiz.ts` |
| **All routine content** — principles (§6), concern routines & product picks (§7), personalization rules | `src/lib/recommendations.ts` |
| Theme colors, fonts, button styles | `src/app/globals.css` |
| Logo placeholder | `src/components/logo.tsx` — swap this component for the real mark |
| Screens | `src/app/page.tsx` (landing), `src/app/quiz/` (quiz), `src/app/results/` (results) |
| Analytics stub | `src/lib/analytics.ts` — events are instrumented; wire a provider in one place |

Content is fully separated from UI: everything a copy editor would touch is
in `src/lib/`, and nothing in `src/app` or `src/components` contains routine
copy or product names.

## Editing content

- **Add/change a product:** edit the `products` map inside the relevant
  concern in `src/lib/recommendations.ts`. Badges available: `vegan`, `new`,
  `staple`, `dupe` (yellow/green accent chips per the design rule).
- **Add a question:** append to `QUESTIONS` in `src/lib/quiz.ts` — the quiz
  UI, progress bar, and resume logic pick it up automatically. Wire its
  effect on results inside `buildRoutine()`.
- **Change a principle guide:** edit `PRINCIPLES` in
  `src/lib/recommendations.ts`; every routine step / note that references its
  id updates everywhere.

## v2 (accounts & saved routines)

The "Save My Routine" button on results is the placeholder. When accounts
land: add Postgres + auth (e.g. NextAuth), replace the sessionStorage mirror
in `src/lib/quiz-context.tsx` with a save-to-server call, and enable the
button. No component rewrites should be needed.

## Pre-launch checklist (from the build spec)

- [ ] Final app name (`src/lib/branding.ts`), logo, domain
- [ ] Set `NEXT_PUBLIC_SITE_URL` for correct Open Graph URLs
- [ ] Final product list review (availability / current formulations)
- [ ] Verify vegan & cruelty-free certifications (Leaping Bunny / PETA lists) —
      status can change with company ownership or regional law
- [ ] Pick an analytics provider and wire `src/lib/analytics.ts`
- [ ] Real Open Graph image
