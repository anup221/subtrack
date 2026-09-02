# SubTrack — Deployment Guide (Frontend on Vercel, Backend on Railway)

A complete, step-by-step walkthrough. The repository is already pushed to GitHub
(`anup221/subtrack`) and is deployment-ready — **no code changes are required**.
The only new file the frontend step asks for is `frontend/vercel.json`, which is
already committed in the repo, so you won't even need to create it.

> Last reviewed: everything below matches the codebase as pushed.

---

## What you're deploying

A React/Vite/TypeScript frontend (`frontend/`) and a Spring Boot backend (`subtrack/`).

| Service | Where it lives | Provider (this guide) |
| --- | --- | --- |
| Backend (Spring Boot, **Java 25**) | repo `subtrack/` | Railway |
| Frontend (React + Vite + TS) | repo `frontend/` | Vercel |
| PostgreSQL 16 | database | Railway Postgres plugin |
| Redis | usage counters | Railway Redis plugin |
| Google OAuth | optional (Step 9) | Google Cloud |
| Razorpay | payments (test mode) | Razorpay |

The backend ships a **prod profile** (`subtrack/src/main/resources/application-prod.yml`)
that reads everything from environment variables, and Flyway applies DB migrations
automatically on first boot. Nothing to edit in the code.

---

## Step 1 — Accounts you need

Create these (all free, except optionally Razorpay):

1. **GitHub** — already done; your repo `anup221/subtrack` is pushed and ready.
2. **Railway** — https://railway.app. New accounts get one-time trial credit (enough to run
   backend + Postgres + Redis for a demo; no card required to start).
3. **Vercel** — https://vercel.com. Free tier is fine.
4. **Google Cloud** — https://console.cloud.google.com (only if you want the "Continue with
   Google" buttons to work).
5. **Razorpay** — https://dashboard.razorpay.com (only if you want real-checkout demo; test keys are free).

> You can complete Step 4 and Step 8 first and defer Google (Step 9) and Razorpay (Step 10) —
> but the backend will only boot once all required env vars below are set. For a first boot you
> may give Google/Razorpay placeholder values, then fill in real ones later (see Step 11 notes).

---

## Step 2 — Deploy PostgreSQL and Redis on Railway

1. Open https://railway.app → sign in → **New Project**.
2. Choose **PostgreSQL** → wait for it to provision. This is the app's primary database.
3. Choose **Redis** → provision it. This backs the usage counters.

You'll copy connection details from each service in Step 6.

---

## Step 3 — Deploy the backend to Railway

1. In your Railway project: **New → GitHub → your `subtrack` repo → Add Service**.
2. In the service **Settings**, set **Root Directory** to `subtrack`
   (Railway then builds from `pom.xml` — it auto-detects Maven).
3. **Deploy** and watch **Deploy Logs** for `BUILD SUCCESS`.
4. If the default start command is wrong, set a **Custom Start Command**:
   ```
   java -jar target/*.jar
   ```
5. Under **Settings → Networking**, note your domain, e.g. `https://subtrack-prod.up.railway.app`.

> **Java 25 requirement:** Railway's default build image must support Java 25 for the Maven
> compile to succeed. If the build fails with an "unsupported class file / invalid source
> release 25" error, choose a Java 25-capable build image (Settings → Build → Image, e.g. a
> `maven:3.9-eclipse-temurin-25` style image) or upgrade the default.

---

## Step 4 — Generate your secrets

Open PowerShell **anywhere** (not inside the repo) and generate two secrets:

```powershell
openssl rand -hex 32   # -> JWT_SECRET
openssl rand -hex 32   # -> WEBHOOK_SECRET
```

Also decide on a secret **`ADMIN_BOOTSTRAP_CODE`** (a password you'll type to create the first
platform admin later). Keep all three somewhere safe.

---

## Step 5 — Set the backend environment variables (Railway)

Go to **your backend service → Variables** and add every row below.

> These are the ONLY place the secrets live. Nothing is committed to the repo.

| Variable | Value |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SERVER_PORT` | `${{PORT}}` (tells Spring to listen on Railway's injected port) |
| `DATABASE_URL` | `jdbc:postgresql://<host>:5432/<db>` from your **PostgreSQL** service → **Variables / Connect** tab |
| `DATABASE_USERNAME` | the Postgres service username |
| `DATABASE_PASSWORD` | the Postgres service password |
| `REDIS_HOST` | Redis service host |
| `REDIS_PORT` | Redis service port |
| `REDIS_PASSWORD` | Redis password (leave empty if the plugin sets none) |
| `JWT_SECRET` | your generated hex string from Step 4 |
| `WEBHOOK_SECRET` | your generated hex string from Step 4 |
| `ADMIN_BOOTSTRAP_CODE` | your private admin signup code |
| `FRONTEND_URL` | `https://<your-frontend>.vercel.app` — **fill in after Step 7** (no trailing slash) |
| `GOOGLE_ORG_CLIENT_ID` | Google step (Step 9) — placeholder OK for now |
| `GOOGLE_ORG_CLIENT_SECRET` | Google step — placeholder OK for now |
| `GOOGLE_ADMIN_CLIENT_ID` | same as org (or a separate client) |
| `GOOGLE_ADMIN_CLIENT_SECRET` | same as org (or separate) |
| `RAZORPAY_KEY_ID` | Razorpay **test** key id (Step 10) |
| `RAZORPAY_KEY_SECRET` | Razorpay **test** key secret |
| `RAZORPAY_WEBHOOK_SECRET` | keep `not-set-up-yet` (or set a real one) |

> All of these must resolve or Spring fails to start with
> `Could not resolve placeholder ...`. Google/Razorpay can be dummy non-empty values for the
> first boot; fill real ones in later.

---

## Step 6 — Verify the backend booted

1. **Deploy** again. Watch **Deploy Logs**. Success looks like:
   ```
   Started SubTrackApplication in X.XXX seconds
   ```
   and a line showing Flyway applied migrations `V1 … V9` automatically.
2. Smoke-test the API in a browser:
   ```
   https://subtrack-prod.up.railway.app/api/plans
   ```
   You should get JSON of the three plans.
3. **Verify the database migration** (Railway → your **PostgreSQL** service → **Data**):
   you should see tables like `organizations`, `subscriptions`, `invoices`,
   `usage_counters`, and a `flyway_schema_history` table listing `V1 … V9`.
   If the tables are there, the backend is healthy.

> Backend is up against the Railway domain now, but CORS will reject browser calls until you
> set the real `FRONTEND_URL` after Vercel exists.

---

## Step 7 — Deploy the frontend to Vercel

1. https://vercel.com → **Add New → Project** → Import your `subtrack` GitHub repo.
2. **Root Directory** → `frontend`.
3. **Framework Preset**: Vite. Build Command `pnpm build`. Output Directory `dist`.
   (The repo already contains `frontend/vercel.json` for deep-link rewrites — you don't need to
   create it.)
4. **Environment Variables**:
   - `VITE_API_URL` = `https://subtrack-prod.up.railway.app`
5. **Deploy**. When it finishes you get e.g. `https://subtrack-ui.vercel.app` (custom domain later).

> `VITE_API_URL` is baked into the JS at build time. If you change the backend URL, change this
> variable and redeploy the frontend.

---

## Step 8 — Wire the two together (CORS + OAuth origin)

The backend only allows requests from its `FRONTEND_URL` (see `SecurityConfig`).

1. On Railway, set the backend variable:
   ```
   FRONTEND_URL=https://subtrack-ui.vercel.app
   ```
   (Exact match — scheme + no trailing slash).
2. Railway auto-redeploys on variable change.
3. Open `https://subtrack-ui.vercel.app` → browser **Network** tab → any API call must return
   **HTTP 200**, not a CORS error. If you see `Access-Control-Allow-Origin` errors, the two URLs
   don't match exactly.

---

## Step 9 — Google OAuth (optional but recommended)

The signup/login pages have "Continue with Google", so real values are worth it.

1. https://console.cloud.google.com → **Create Project** (e.g. `subtrack`).
2. **APIs & Services → OAuth consent screen → External** → fill app name/email → **Publish**.
3. **Credentials → Create Credentials → OAuth client ID → Web application**.
4. Add both Authorized redirect URIs (exact strings):
   - `https://subtrack-prod.up.railway.app/login/oauth2/code/google-org`
   - `https://subtrack-prod.up.railway.app/login/oauth2/code/google-admin`
5. Copy the client ID / secret into the backend env vars from Step 5 (you may reuse one client
   for both `google-org` and `google-admin`).

> If you skip this, keep dummy non-empty Google env vars so the app boots; tell reviewers the
> Google button is disabled in the demo.

---

## Step 10 — Razorpay test keys (payments)

1. https://dashboard.razorpay.com → register (free).
2. **Settings → API Keys** → switch to **Test Mode**.
3. Copy **Key ID** and **Key Secret** into the backend env vars from Step 5.
4. Test card for later signoff: `4111 1111 1111 1111`, any future expiry, any CVV.

---

## Step 11 — Notes on production-only endpoints

The repo contains a dev mock endpoint `/api/payments/pay/{invoiceId}` and a manual billing
trigger `/api/invoices/run-cycle`. The production checkout uses only
`/api/payments/razorpay/*`. The `run-cycle` trigger is for demo/admin use; if you want it
hardened, keep it off the public internet or remove it from the prod profile. The frontend
doesn't call either in production, so this is fine as-is for a resume demo.

---

## Step 12 — Global smoke test (full user journey)

1. Open `https://subtrack-ui.vercel.app`.
2. **Create an organization** (email/password works without Google).
3. Log into the dashboard → change plan at `/pricing` → pay with test card `4111 1111 1111 1111`.
4. `/usage` — the chart should animate with an indigo line.
5. `/billing` — an invoice exists for your paid subscription; pay/cancel behaves.
6. Sign out, sign back in.

If anything 500s, jump to Step 14.

---

## Step 13 — Admin console sign-off

1. Visit `https://subtrack-ui.vercel.app/admin/login`.
2. Enter `ADMIN_BOOTSTRAP_CODE` from Step 4 (first time creates the admin).
3. You land in the Admin console:
   - Dashboard shows MRR / orgs / subscriptions / churn.
   - "Recently added organizations" lists everything.
   - `All tenants` → open a tenant → delete/block a demo org (optional).
4. The admin JWT is independent of org JWTs; `/admin/*` routes are gated by the backend.

---

## Step 14 — Troubleshooting

| Symptom | Cause → Fix |
| --- | --- |
| Backend won't start: `Could not resolve placeholder` | A required env var is missing → re-check Step 5 list |
| Backend won't start: log mentions `PORT` | Set `SERVER_PORT` = `${{PORT}}` |
| Java build fails: `invalid source release 25` | Build image doesn't support Java 25 → pick a `temurin-25`/Java 25 Maven image (Step 3, note) |
| Migrations never ran / empty tables | Flyway runs only at first boot → recreate the Postgres service to re-run cleanly |
| Frontend blank / white screen | `VITE_API_URL` not set at build time → set it and redeploy |
| CORS error on every API call | `FRONTEND_URL` on Railway doesn't match the Vercel URL exactly (scheme + no slash) |
| Deep link returns 404 | `frontend/vercel.json` rewrites missing → it's already committed (Step 7) |
| Google button errors | Redirect URIs not exactly the two from Step 9, or consent screen not published |
| Checkout fails | Razorpay keys are in **Test Mode** and card is test `4111 1111 1111 1111` |
| Service sleeps on first load | Free/trial tiers sleep after inactivity — normal; click again |
| Trial credit ran out | Cheapest demo: one paid Railway Postgres + backend, Redis on Upstash, or one VPS |

---

## Step 15 — What to put on your resume

- Screenshots: dashboard, pricing/checkout with Razorpay badge, usage chart, admin console.
- A 2–3 minute Loom walking through the owner flow then the admin flow.
- In your README: architecture diagram + text:
  > SubTrack — multi-tenant SaaS billing platform. React + TypeScript frontend on Vercel;
  > Spring Boot backend on Railway with PostgreSQL 16 (Flyway-managed), Redis usage counters,
  > JWT + Google OAuth, Razorpay test-mode billing, a JWT-resolved tenant isolation layer,
  > and a separate platform-admin console.
- Honest notes: payments run in Razorpay test mode; free-tier services may sleep after idling.

---

## Step 16 — Redo / teardown

- **Railway**: delete the project (kills Postgres + Redis + backend).
- **Vercel**: Remove Project.
- **Google / Razorpay**: revoke OAuth client / test keys when you stop.

Redeploying later is just `git push` (Vercel) and redeploy (Railway) — no setup again.
