# HairIQ

Quiz-based hair care routine builder. Eleven questions in, one personalized
routine out — broken into **Wash Day / Every Day / At Night** steps, with
product picks across three always-available tabs: **Affordable, Luxury, and
Cruelty-Free** (all three are pre-calculated on every result; Q11 only picks
which tab you land on). The tier's internal data key is still `drugstore`
(renamed to "Affordable" in the UI per spec §8.10).

> v1 scope: no login, no database — pure quiz → results, all state
> client-side, plus the free segmented email signup (spec §12, wired to a
> third-party provider via env vars). The v2 roadmap (accounts, saved
> history, tracker, payments…) lives in `SPEC.md` section 13 and is
> intentionally **not** built here.

## Run it

```bash
cd hairiq
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run build:demo # regenerate demo/index.html (single-file live demo)
```

## Where things live

The content is deliberately separated from the UI so copy and product picks
can be edited without touching components:

| File | What's in it |
| --- | --- |
| `lib/questions.js` | The 11 quiz questions + options (Q7 is multi-select) |
| `lib/principles.js` | Section-6 copy blocks (pre-poo, sweat rule, K18 usage, LOC/LCO…) rendered as expandable "Why this works" details |
| `lib/products.js` | The full product library (spec sections 6–8 + 10–11) with tier, cruelty-free status/notes, and step categories |
| `lib/recommendations.js` | The engine: concern routines (§7), framework steps + time-based depth (§8–9), answer-driven logic (§6), length gating + brush lookup (§11) |
| `lib/config.js` | The premium price + "Unlock for $X" paywall copy (ONE place, per §13.1) and newsletter tier topics |
| `app/api/subscribe/route.js` | Email signup endpoint — stores to our own Postgres when a connection string is set (see below) |
| `app/` | Screens: landing → `/quiz` → `/results` |
| `components/` | UI only — no content (`EmailSignup.js` is the §12 form) |
| `scripts/build-demo.mjs` | Bundles the `lib/` files + a vanilla-JS shell into `demo/index.html` — a dependency-free, single-file version of the whole app for sharing |

### How a routine is assembled

1. **Q4 (main concern)** picks the concern-specific steps and highlighted
   default products (spec §7).
2. **Q9 (time available)** gates the framework extras: Core (5 min) →
   Standard (10–15) → Full (20+) (spec §9, drawing on §8).
3. Everything else — hair length, scalp type, density, chemical history,
   heat habits, wash frequency — adjusts steps, copy, and product order:
   short hair skips the pre-poo step entirely and gets a lighter night
   routine (§11.1), hair type picks the brush (boar bristle for straight,
   wet detangling brush for textured — §11.2), fine hair gets weightless
   oils first, box dye triggers the chelating-shampoo note, and porosity
   decides LOC vs LCO order.

Every step carries products for **all three tiers**, so the results tabs
switch instantly with no recalculation. Bond repair renders as ONE step
with a pick-one timing choice (in-shower highlighted), per the §8 callout.

## Email signup (spec §12)

The results page ends with the free segmented newsletter form: tier topics
(multi-select, plus an "All three" option), email, and optional ZIP. It
posts to `/api/subscribe`, which stores signups in **our own Postgres** —
no third-party marketing account needed to capture the list. The table
`hairiq_subscribers` (email unique, `tiers text[]`, zip, created_at) is
auto-created on first signup; re-signups update preferences instead of
erroring. On Vercel, attach Vercel Postgres and `POSTGRES_URL` is set
automatically (any Postgres works via `DATABASE_URL` — see `.env.example`);
until one is set, signups validate but are not stored and the server logs
a warning.

Honest limit, per the spec: *sending* newsletters later needs an email
delivery service (Resend, Postmark, etc.) with human domain/sender
verification — a separate future task. This table, with its tier tags and
ZIPs, is exactly the segmented list that service will import.

### Cruelty-free tab

Cruelty-free is brand-level data in `lib/products.js` (`crueltyFree`,
`cfNote`, and `cfOnly` for section-10 brands that shouldn't dilute the
curated Drugstore/Luxury lists). Certification detail shows in the tab.
⚠️ Per the spec: statuses change with ownership/regional law — re-verify
via Leaping Bunny / PETA before launch.

## Before launch (open items from the spec)

- Final app name ("HairIQ" is a placeholder — find/replace + `app/layout.js` metadata + logo in `app/page.js`)
- Logo/wordmark + domain
- Product list review (availability/formulations) + cruelty-free re-verification
- Keep expanding the section-10 cruelty-free library in `lib/products.js`

## v2 notes

Accounts/saved routines slot in at `components/QuizProvider.js` (currently
sessionStorage) — swap its storage for an API without touching screens.
Postgres + auth (e.g. NextAuth) + Stripe per spec §12; see §12.7 for the
suggested build order.
