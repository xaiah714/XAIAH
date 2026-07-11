# HairIQ

Quiz-based hair care routine builder. Ten questions in, one personalized
routine out — broken into **Wash Day / Every Day / At Night** steps, with
product picks across three always-available tabs: **Drugstore, Luxury, and
Cruelty-Free** (all three are pre-calculated on every result; Q10 only picks
which tab you land on).

> v1 scope: no login, no email capture, no database — pure quiz → results,
> all state client-side. The v2 roadmap (accounts, saved history, tracker,
> payments…) lives in the build spec, section 12, and is intentionally
> **not** built here.

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
| `lib/questions.js` | The 10 quiz questions + options (Q6 is multi-select) |
| `lib/principles.js` | Section-6 copy blocks (pre-poo, sweat rule, K18 usage, LOC/LCO…) rendered as expandable "Why this works" details |
| `lib/products.js` | The full product library (spec sections 6–8 + 10) with tier, cruelty-free status/notes, and step categories |
| `lib/recommendations.js` | The engine: concern routines (section 7), framework steps + time-based depth (sections 8–9), and answer-driven logic (section 6) |
| `app/` | Screens: landing → `/quiz` → `/results` |
| `components/` | UI only — no content |
| `scripts/build-demo.mjs` | Bundles the four `lib/` files + a vanilla-JS shell into `demo/index.html` — a dependency-free, single-file version of the whole app for sharing |

### How a routine is assembled

1. **Q4 (main concern)** picks the concern-specific steps and highlighted
   default products (spec §7).
2. **Q9 (time available)** gates the framework extras: Core (5 min) →
   Standard (10–15) → Full (20+) (spec §9, drawing on §8).
3. Everything else — scalp type, density, chemical history, heat habits,
   wash frequency — adjusts copy, product preference order (e.g. weightless
   coconut oil for fine hair, chelating shampoo after box dye, LOC vs LCO
   by porosity), and the "Good to know" notes.

Every step carries products for **all three tiers**, so the results tabs
switch instantly with no recalculation.

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
