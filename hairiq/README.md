# How Is My Hair

Quiz-based hair care routine builder. Eleven questions in, one personalized
routine out — broken into **Wash Day / Every Day / At Night** steps, with
product picks across three always-available tabs: **Affordable, Luxury, and
Cruelty-Free** (all three are pre-calculated on every result; Q11 only picks
which tab you land on). The tier's internal data key is still `drugstore`
(renamed to "Affordable" in the UI per spec §8.10). Scalp (Q4), goals (Q6),
and chemical treatments (Q7) are **multi-select** — overlapping realities
like "oily AND flaky" are first-class answers.

> v1 scope: no login — pure quiz → results, all state client-side, plus
> the free segmented email signup (spec §12: stored in our own Postgres,
> confirmation email + dashboard-managed newsletters via Resend) and the
> real "$1.99 unlock" via Stripe Checkout (device-local unlock enabling
> Save My Routine — see below). Results show ONE section at a time
> (Wash Day / Daily / At Night / Tips sub-tabs) to keep the page short
> and scannable. An 🌐 Español toggle machine-translates every screen via
> Google Website Translator (native-Spanish copy is a future quality
> upgrade). The rest of the v2 roadmap (accounts, saved history,
> tracker…) lives in `SPEC.md` section 13 and is intentionally **not**
> built here.

## Branding

The circular logo lives at `public/logo.svg` (shown on the landing page)
and `app/icon.svg` (the favicon) — currently a generated placeholder.
**To use the real logo: replace those two files.** Any square image works;
it renders inside a circle. No code changes needed. The wordmark renders
in Pacifico (chunky cursive), loaded via `next/font` in the app and
embedded as a base64 woff2 in the demo (`scripts/pacifico-latin.woff2`).

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
| `app/api/subscribe/route.js` | Email signup endpoint — stores to our own Postgres + sends the Resend confirmation email (see below) |
| `lib/email.js` | Resend integration: welcome email + Audience mirror for dashboard newsletters |
| `app/api/checkout/route.js` | Stripe Checkout for the $1.99 unlock (create + verify session) |
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

## Email signup (spec §12) + delivery (rev 7)

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

Delivery is wired through **Resend** (`lib/email.js`): with
`RESEND_API_KEY` set, every signup receives a branded confirmation email
and is mirrored into a Resend Audience (`RESEND_AUDIENCE_ID`), so future
newsletters are written and sent from Resend's **Broadcasts** dashboard —
no code, unsubscribe links handled automatically. The one human step
before real-world delivery: verify the sending domain in Resend and set
`NEWSLETTER_FROM` (until then the resend.dev test sender only delivers to
the account owner's inbox). Postgres stays the segmented source of truth
(tiers + ZIP) for anything Audiences can't express.

## Premium unlock (spec §13.1) — Stripe Checkout (rev 7)

"Save My Routine" starts a **hosted Stripe Checkout** for the one-time
$1.99 (`lib/config.js` is the single price source; or set
`STRIPE_PRICE_ID` to manage the price from the Stripe dashboard). Card,
Apple Pay, and Google Pay all appear automatically on Stripe's page.
Flow: click → `/api/checkout` creates the session → Stripe's payment page
→ success redirect back to `/results?session_id=…` → the API verifies the
session is paid → the device unlocks (localStorage; accounts are §13 v2)
→ Save My Routine persists the routine and the home screen grows a
"View my saved routine" link. Until `STRIPE_SECRET_KEY` is set, the
button shows a friendly "payments are almost live" note instead of a
broken checkout.

### Cruelty-free tab

Cruelty-free is brand-level data in `lib/products.js` (`crueltyFree`,
`cfNote`, and `cfOnly` for section-10 brands that shouldn't dilute the
curated Drugstore/Luxury lists). Certification detail shows in the tab.
⚠️ Per the spec: statuses change with ownership/regional law — re-verify
via Leaping Bunny / PETA before launch.

## Before launch (open items from the spec)

- Logo/wordmark + domain
- Product list review (availability/formulations) + cruelty-free re-verification
- Keep expanding the section-10 cruelty-free library in `lib/products.js`

## v2 notes

Accounts/saved routines slot in at `components/QuizProvider.js` (currently
sessionStorage) — swap its storage for an API without touching screens.
Postgres + auth (e.g. NextAuth) + Stripe per spec §13; see §13.7 for the
suggested build order.
