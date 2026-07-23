# Launching How Is My Hair — Cloudflare + Supabase

The app is fully wired for this stack and the Cloudflare build is
verified. Everything below is one-time setup, ~30–45 minutes total, and
fits comfortably in both platforms' **free tiers** (usage credits are
pure cushion). Do the steps in order.

---

## 1. Supabase (the database — stores newsletter signups)

1. Go to **supabase.com** → sign up (free) → **New project**.
   Name it `how-is-my-hair`, pick the region closest to your users,
   set a strong database password (save it, but the app doesn't need it).
2. In the dashboard: **SQL Editor** → paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql) → **Run**. That creates
   the `hairiq_subscribers` table. Done — one query, once.
3. Collect two values (**Project Settings → API**):
   - **Project URL** → this is `SUPABASE_URL`
   - **`service_role` secret key** → this is `SUPABASE_SERVICE_ROLE_KEY`
     ⚠️ server-only — never paste it into client code or share it.

You can watch signups arrive in **Table Editor → hairiq_subscribers**.

## 2. Cloudflare (the host — serves the website)

1. Go to **cloudflare.com** → sign up (free plan is fine).
2. On your computer (or hand me an API token — see below), from the
   `hairiq/` folder:

   ```bash
   npm install
   npx wrangler login        # opens the browser to authorize
   npm run deploy            # builds + deploys
   ```

   That's it — the site is live at
   `https://how-is-my-hair.<your-subdomain>.workers.dev`.
3. Set the production secrets (each command prompts you to paste the value):

   ```bash
   npx wrangler secret put SUPABASE_URL
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   npx wrangler secret put STRIPE_SECRET_KEY      # when ready (step 4)
   npx wrangler secret put RESEND_API_KEY         # when ready (step 5)
   ```

   Re-run `npm run deploy` after adding secrets.

**Prefer that I deploy?** Create an API token instead of logging in:
Cloudflare dashboard → My Profile → **API Tokens** → Create Token →
template **"Edit Cloudflare Workers"** → copy it and paste it to me in
chat along with the two Supabase values, and I'll deploy from here.
(You can delete/rotate the token right after.)

## 3. Your domain

- Buy the domain in Cloudflare directly (**Registrar → Register domain**,
  at-cost pricing) — easiest, since DNS is then already there.
- Then: **Workers & Pages → how-is-my-hair → Settings → Domains &
  Routes → Add → Custom domain** → type the domain → done. HTTPS is
  automatic.

## 4. Stripe (the $1.99 unlock)

1. **stripe.com** → create account → finish business verification.
2. Developers → API keys → copy the **Secret key** (`sk_live_…`, or
   `sk_test_…` to try it first) → `wrangler secret put STRIPE_SECRET_KEY`.
3. Apple Pay / Google Pay: Settings → **Payment method domains** → add
   your domain. Card payments work with zero extra setup.
4. Optional: create a Product + Price in Stripe and
   `wrangler secret put STRIPE_PRICE_ID` to change the price from the
   dashboard without a deploy (otherwise the $1.99 in `lib/config.js` is
   charged).

## 5. Resend (confirmation emails + newsletters)

1. **resend.com** → create account → API Keys → copy →
   `wrangler secret put RESEND_API_KEY`.
2. Domains → add your domain → add the DNS records it shows (in
   Cloudflare DNS — takes 2 minutes, verifies fast) → then
   `wrangler secret put NEWSLETTER_FROM` with e.g.
   `How Is My Hair <hello@yourdomain.com>`.
3. Optional: Audiences → create one → `wrangler secret put
   RESEND_AUDIENCE_ID`. Newsletters are then written and sent from
   Resend's **Broadcasts** tab — no code, unsubscribe links automatic.

## 6. Verify the live site (5-minute checklist)

- Landing loads on your domain, logo + fonts look right on your phone.
- Take the quiz → results render; switch all three tabs + the four
  section tabs.
- Sign up with your real email → row appears in Supabase Table Editor →
  confirmation email arrives (after step 5).
- Click **Save My Routine** → Stripe checkout opens → pay with a test
  card (`4242 4242 4242 4242`, any future date/CVC, in test mode) →
  redirected back → routine saves, home screen shows "View my saved
  routine".
- Tap 🌐 **Español** → page translates (on the live site this uses
  Google's translator; the built-in Spanish dictionary in
  `lib/i18n-es.js` is the future native upgrade).

## Costs

| Service | Free tier covers | You pay when |
| --- | --- | --- |
| Cloudflare Workers | 100k requests/day | far beyond launch traffic |
| Supabase | 500MB database | ~millions of signup rows |
| Resend | 3k emails/month | list outgrows it |
| Stripe | no monthly fee | 2.9% + 30¢ per sale (their cut) |
| Domain | — | ~$10/yr at Cloudflare's at-cost pricing |
