# Deploying TutorApp to Railway (staging)

Railway hosts the app **and** the Postgres database together in one project
— no separate database provider needed. You'll set up three things, all in
the Railway dashboard: the **web app**, the **database**, and a small
**cron worker** (it sends the 15-minute "still working on it" notices,
does the 30-minute escalations, and runs weekly tutor payouts).

Almost everything is automated: on every deploy the app syncs the database
schema itself and creates the admin account from the env vars you set. You
never need to run a command on your own computer.

> **Tell your testers up front:** photo uploads don't persist yet. Uploaded
> photos disappear whenever the app redeploys or restarts, because they're
> written to the app's local disk. Everything else works; photo *storage*
> gets fixed when we swap `src/lib/uploads.ts` to S3/R2. Don't let testers
> think lost photos are a bug in the upload flow.

---

## One-time setup (about 15 minutes, all in the browser)

### Step 1 — Create the Railway account and project

1. Go to [railway.app](https://railway.app) → **Login** → sign in **with
   GitHub** (this matters — it's how Railway sees your repo).
2. You'll land on the dashboard. Click **+ New** (or "New Project").
3. Choose **Deploy from GitHub repo** → pick **xaiah714/XAIAH**.
   - If the repo isn't listed, click **Configure GitHub App** and grant
     Railway access to it, then come back.
4. Railway creates a project with one service (the web app) and starts a
   first build. **That first deploy will fail — expected.** It has no
   database or settings yet. Keep going.

> By default Railway deploys the repo's default branch. To deploy the
> current work branch instead: click the service → **Settings** → under
> **Source**, change the branch to `claude/tutorapp-product-spec-m30ua5`.

### Step 2 — Add the Postgres database

1. Inside the project, click **+ Create** (top right) → **Database** →
   **Add PostgreSQL**.
2. That's it. A `Postgres` box appears next to your app. Railway wires up
   its credentials automatically; you'll connect the app to it in Step 3.

### Step 3 — Set the web app's environment variables

1. Click the **web app service** (the box named after the repo).
2. Open the **Variables** tab.
3. Click **Raw Editor** (easiest — paste everything at once), paste the
   block below, then **Save** / **Deploy** the change:

   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   AUTH_SECRET=REPLACE-WITH-A-LONG-RANDOM-STRING
   AUTH_TRUST_HOST=true
   ADMIN_EMAIL=you@yourdomain.com
   ADMIN_PASSWORD=REPLACE-WITH-A-STRONG-PASSWORD
   ADMIN_ALERT_EMAIL=you@yourdomain.com
   CRON_SECRET=REPLACE-WITH-ANOTHER-RANDOM-STRING
   EMAIL_FROM=TutorApp <onboarding@resend.dev>
   ```

   - `${{Postgres.DATABASE_URL}}` is literal — type it exactly like that.
     It's a Railway "reference": it auto-fills the database address.
   - For the two random strings: [random.org/strings](https://www.random.org/strings/)
     or just mash 40+ random characters. They're secrets, not passwords
     you'll ever type.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` become your **admin login** on the
     site (`/login`). `ADMIN_ALERT_EMAIL` is where tutor-disagreement
     alerts go.

### Step 4 — Give the app a public URL

1. Same service → **Settings** tab → **Networking** section →
   **Generate Domain**. Accept the suggested port if asked.
2. You get a URL like `https://xaiah-production-xxxx.up.railway.app`.
   Copy it.
3. Go back to **Variables** and add one more:

   ```env
   NEXT_PUBLIC_APP_URL=https://your-generated-url.up.railway.app
   ```

   (Your real URL, no trailing slash.) Save — Railway redeploys.
4. When the deploy goes green, open the URL. You should see the TutorApp
   landing page, and you can log in with `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

### Step 5 — Add the cron worker (second service, same repo)

1. In the project, click **+ Create** → **GitHub Repo** → pick
   **xaiah714/XAIAH** again (same branch as Step 1's note, if you changed
   it).
2. Do **not** generate a domain for this one — it's internal.
3. Open its **Variables** tab → **Raw Editor** → paste just:

   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SERVICE_ROLE=cron-worker
   ```

   (`SERVICE_ROLE=cron-worker` is what makes this service run the
   scheduler instead of the web app — no custom start command needed.)

   (Add `STRIPE_SECRET_KEY` here too later, when you have it — the weekly
   payout job is what actually moves money via Stripe.)
4. Deploy. Its logs should show:
   `[cron-worker] started — sweep every 5 min, weekly payouts Mondays 12:00 UTC.`
5. Optional rename so the dashboard reads nicely: Settings → change the
   service name to `cron-worker`.

**Done.** The app is live, the database is connected, schema sync + admin
seeding happen automatically on every deploy, and the scheduled jobs run.
Every push to the configured branch auto-deploys both services.

---

## Environment variable reference

Set on the **web app** service (Raw Editor makes this copy-paste):

| Variable | When | What it does / notes |
| --- | --- | --- |
| `DATABASE_URL` | **Now** | Exactly `${{Postgres.DATABASE_URL}}` — Railway fills it in. |
| `AUTH_SECRET` | **Now** | Long random string; signs login sessions. |
| `AUTH_TRUST_HOST` | **Now** | Set to `true` — required for login to work behind Railway's proxy (without it, every auth endpoint 500s). |
| `NEXT_PUBLIC_APP_URL` | **Now** (Step 4) | The generated public URL. Used in emails + Stripe redirects. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | **Now** | Auto-creates your admin account on deploy (never overwrites it after that — changing the password here later does nothing). |
| `ADMIN_ALERT_EMAIL` | **Now** | Where tutor-disagreement alerts are emailed. Blank = logged only. |
| `CRON_SECRET` | **Now** | Protects the manual-trigger URLs (`/api/cron/...`). The worker doesn't need it. |
| `EMAIL_FROM` | **Now** | Email sender name/address (used once Resend is on). |
| `RESEND_API_KEY` | **Later** | Blank = all emails (verification links, dispute notices) print to the service **Logs** instead of sending. During early testing, find verification links in: web service → **Deployments** → **View Logs**. |
| `STRIPE_SECRET_KEY` | **Later** | Test-mode key (`sk_test_...`). Blank = payment buttons error at point of use; everything else works. Add to **both** services (the worker pays tutors). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Later** | Test-mode publishable key. |
| `STRIPE_WEBHOOK_SECRET` | **Later** | From a Stripe webhook endpoint pointed at `https://<your-url>/api/stripe/webhook` with events `checkout.session.completed`, `invoice.paid`, `account.updated`. |
| `STRIPE_SUBSCRIPTION_PRICE_ID` / `STRIPE_PAY_PER_SESSION_PRICE_ID` | **Later** | Optional; blank = built-in $7/mo and $3 test prices. |
| `ANTHROPIC_API_KEY` | **Parked** | Not used by anything active — the AI synthesis feature is disabled in the launch flow. Leave blank. |

Adding a "later" key: Variables tab → add it → Railway redeploys. No code
changes ever needed for these.

## How the scheduled jobs work here

Vercel-style `vercel.json` crons don't exist on Railway. Instead the
`cron-worker` service (Step 5) is a tiny always-on process
(`scripts/cron-worker.ts`) that:

- runs the unanswered-question sweep every 5 minutes (15-min "still
  working on connecting you" notice, 30-min auto-escalation), and
- runs weekly tutor payouts Mondays 12:00 UTC, with a database guard so a
  restart can never pay tutors twice in one week.

This was chosen over Railway's native per-service cron schedules because
it's one service instead of two, has no cold-start timing drift, and the
guard logic lives in code you can read. The old manual-trigger URLs still
work if you ever want to force a run:
`curl -H "Authorization: Bearer <CRON_SECRET>" https://<your-url>/api/cron/question-sweep`

## Known staging limitations

- **Photo uploads don't persist** (see the note at the top — tell
  testers!). Swap `src/lib/uploads.ts` to S3/R2/Cloudinary to fix.
- **Live chat polls** every 2.5s per open chat window — fine at test
  scale, just expect steady request logs.
- **Costs**: Railway's Hobby plan (~$5/mo) comfortably covers the web
  app + worker + Postgres at testing volume.
