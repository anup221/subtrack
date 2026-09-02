# SubTrack — Deployment Guide (Frontend on Vercel, Backend on Railway)

End-to-end, step-by-step instructions. **No code changes are required.**
The only new file this guide asks you to create is `frontend/vercel.json` (a config file, described in Step 12).

---

## 0. What you are deploying

A React/Vite frontend (in `frontend/`) and a Spring Boot backend (in `subtrack/`) that needs:

| Service | Where it lives | Provider (this guide) |
| --- | --- | --- |
| Backend (Spring Boot, Java 17+) | repo `subtrack/` | Railway |
| Frontend (React + Vite + TS) | repo `frontend/` | Vercel |
| PostgreSQL 16 | database | Railway Postgres plugin |
| Redis | usage counters | Railway Redis plugin |
| Google OAuth | optional (see Step 10) | Google Cloud |
| Razorpay | payments (test mode) | Razorpay |

The backend already ships a **production profile** (`subtrack/src/main/resources/application-prod.yml`)
that reads everything from environment variables, and Flyway applies database migrations
automatically on first boot. There is nothing to edit in the code.

---

## 1. Prerequisites — accounts and accounts

Create (free, except optionally Razorpay):

1. **GitHub** account — your code lives here and both Railway + Vercel deploy from it.
2. **Railway** account — https://railway.app. New accounts get a one-time trial credit (enough
   to run the backend + Postgres + Redis for a demo; no card required to start).
3. **Vercel** account — https://vercel.com. Free tier is fine.
4. **Google Cloud** account — only needed if you want the "Continue with Google" button to work.
5. **Razorpay** account — only needed if you want to demo real checkout; test-mode keys are free.

---

## 2. Prepare the repository

1. Open PowerShell in `D:\subtrack`.
2. If it is not already a git repo:
   ```powershell
   git init
   git add .
   git commit -m "SubTrack - multi-tenant SaaS billing platform"
   ```
3. Create a **private or public** repo on GitHub, then:
   ```powershell
   git remote add origin https://github.com/<your-username>/subtrack.git
   git branch -M main
   git push -u origin main
   ```
4. **Security check — do NOT skip:**
   - Confirm `subtrack/src/main/resources/application-local.yml` is **gitignored**
     (it holds your real Google/Razorpay secrets). It was already added to `.gitignore`.
   - Never commit `frontend/.env` — it is a Vercel dashboard setting, not a file you push.

---

## 3. Rent the two horses on Railway

1. Open https://railway.app → **New Project**.
2. Choose **PostgreSQL** → creates a Postgres service.
3. Choose **Redis** → creates a Redis service.

> Railway trial credit: you get a one-time allotment on a new account. For a resume demo the
> cost is near zero while it lasts. When the credit runs out, the simplest move is to keep the
> Postgres + backend, or clone everything onto a cheap hobby VPS — not required today.

---

## 4. Deploy the backend to Railway

1. In your Railway project: **New → GitHub → your `subtrack` repo → Add Service**.
2. In the service settings set **Root Directory** to `subtrack`
   (Railway then builds with `pom.xml` — it auto-detects Maven).
3. Under **Settings → Deploy**, wait for one build so the logs show `BUILD SUCCESS`.
   If the default start command is wrong, set a **Custom Start Command**:
   ```
   java -jar target/*.jar
   ```
4. Under **Settings → Networking**, note your domain: `https://subtrack-prod.up.railway.app`.
5. **Service → Variables** → add all of the following (replace the placeholders):

| Variable | Value |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SERVER_PORT` | `${{PORT}}` (tells Spring to listen on the port Railway injects) |
| `DATABASE_URL` | `jdbc:postgresql://<host>:5432/<db>` (from your PostgreSQL service → Variables/Connect tab) |
| `DATABASE_USERNAME` | Postgres service username |
| `DATABASE_PASSWORD` | Postgres service password |
| `REDIS_HOST` | Redis service host |
| `REDIS_PORT` | Redis service port |
| `REDIS_PASSWORD` | Redis service password (leave empty if none) |
| `JWT_SECRET` | generate one: `openssl rand -hex 32` |
| `WEBHOOK_SECRET` | generate one: `openssl rand -hex 32` |
| `ADMIN_BOOTSTRAP_CODE` | your secret admin signup code |
| `FRONTEND_URL` | `https://<your-frontend>.vercel.app` (fill in after Step 11) |
| `GOOGLE_ORG_CLIENT_ID` | see Step 10 (can be a dummy until then) |
| `GOOGLE_ORG_CLIENT_SECRET` | see Step 10 (can be a dummy until then) |
| `GOOGLE_ADMIN_CLIENT_ID` | same as org (or a separate admin client) |
| `GOOGLE_ADMIN_CLIENT_SECRET` | same as org (or separate) |
| `RAZORPAY_KEY_ID` | Razorpay **test** key id |
| `RAZORPAY_KEY_SECRET` | Razorpay **test** key secret |
| `RAZORPAY_WEBHOOK_SECRET` | keep the value `not-set-up-yet` (or set a real one) |

> All of these must resolve or Spring will fail to start (the prod profile uses
> `${...}` placeholders). For a first boot you may give Google and Razorpay env vars
> placeholder values **only if** you also remove the unused buttons later — better: set real
> test values as in Steps 6 and 10, they cost nothing.

6. Deploy again. Watch **Deploy Logs**. Success looks like:
   ```
   Started SubTrackApplication in X.XXX seconds
   ```
   plus a line showing migrations applied (Flyway ran `V1`…`V9` automatically).
7. Smoke-test the API in a browser:
   ```
   https://subtrack-prod.up.railway.app/api/plans
   ```
   You should get JSON of the three plans.

---

## 5. Verify the database migration

Postgres was created empty, but it is not empty anymore after the backend booted:

1. Railway → your **PostgreSQL** service → **Data** (or connect with any PG client).
2. You should see tables such as `organizations`, `subscriptions`, `invoices`, `usage_counters`
   and a Flyway `flyway_schema_history` table listing `V1 … V9`.

If the tables are there, the backend is healthy.

---

## 6. Razorpay test keys (payments)

1. https://dashboard.razorpay.com → register (free).
2. **Settings → API Keys** and switch the toggle to **Test Mode**.
3. Copy **Key ID** and **Key Secret** into the backend env vars from Step 4.
4. Test-card for later signoff: `4111 1111 1111 1111`, any future expiry, any CVV.

---

## 7. Google OAuth (optional but recommended — the "Continue with Google" buttons)

The registration/login pages offer Google login, so giving it real values is worth it.

1. https://console.cloud.google.com → **Create Project** (e.g., "subtrack").
2. **APIs & Services → OAuth consent screen** → External → fill app name/email → Publish.
3. **Credentials → Create Credentials → OAuth client ID → Web application**.
4. Authorized redirect URIs (exact strings, both required):
   - `https://subtrack-prod.up.railway.app/login/oauth2/code/google-org`
   - `https://subtrack-prod.up.railway.app/login/oauth2/code/google-admin`
5. Copy the client ID/secret into the matching backend env vars (Step 4). You may reuse the
   same client for `google-org` and `google-admin`.

> If you skip this, set `GOOGLE_ORG_CLIENT_ID` / `GOOGLE_ORG_CLIENT_SECRET` to any non-empty
> dummy strings so the app boots — and tell reviewers the Google button is disabled in the demo.
> Turning the button off is a code change, so weigh it against just doing Step 7.

---

## 8. Deploy the frontend to Vercel

1. https://vercel.com → **Add New → Project** → Import your `subtrack` GitHub repo.
2. **Root Directory** → `frontend`.
3. **Framework Preset**: Vite → Build Command: `pnpm build` → Output Directory: `dist`.
4. **Environment Variables**:
   - `VITE_API_URL` = `https://subtrack-prod.up.railway.app`
5. Deploy. When it finishes you get `https://subtrack-ui.vercel.app` (custom domain any time).

---

## 9. Serve the build

The output of `pnpm build` is static files in `dist/`. Vercel serves them automatically.
Two finishing touches:

1. Go to **Project → Settings → General → Build & Development Settings** and confirm root is
   `frontend` and output is `dist`.
2. Make deep links work (React Router paths like `/dashboard`, `/admin/tenants/...`). Create a
   new file `frontend/vercel.json`:
   ```json
   {
     "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }]
   }
   ```
   Commit and push:
   ```powershell
   git add frontend/vercel.json
   git commit -m "Vercel SPA rewrites"
   git push
   ```
   Vercel re-deploys automatically on push.

---

## 10. Talking to each other (CORS + OAuth origin)

Spring only allows requests from `FRONTEND_URL` (configured in `SecurityConfig`):

1. Now that Vercel gave you a URL, set the backend variable:
   ```
   FRONTEND_URL=https://subtrack-ui.vercel.app
   ```
   (No trailing slash.)
2. Redeploy the backend (Railway auto-redeploys on variable change).
3. Fallback test: open `https://subtrack-ui.vercel.app` and check the browser **Network** tab —
   any API call must return HTTP 200, not a CORS error. If you ever see
   `Access-Control-Allow-Origin` errors, `FRONTEND_URL` does not match the Vercel URL exactly.

---

## 11. Global smoke test — the full user journey

1. Open `https://subtrack-ui.vercel.app`.
2. **Create an organization** (email/password works without Google).
3. You log into the dashboard. Change the plan at `/pricing`:
   - Pay with test card `4111 1111 1111 1111`.
4. `/usage` — the chart should animate with an indigo line.
5. `/billing` — an invoice exists for your paid subscription; pay/cancel behaves.
6. Sign out, sign back in.

If anything 500s, jump to Step 14.

---

## 12. Admin console sign-off

1. Visit `https://subtrack-ui.vercel.app/admin/login`.
2. Enter `ADMIN_BOOTSTRAP_CODE` from Step 4 (render only to you).
3. You land in the Admin console:
   - Dashboard shows MRR / orgs / subscriptions / churn.
   - "Recently added organizations" lists everything.
   - `All tenants` → open a tenant → delete/block a demo org (optional).
4. The admin JWT is independent of org JWTs; `/admin/*` routes are gated by the backend.

---

## 13. What to put on your resume

- Screenshots: dashboard, pricing/checkout with Razorpay badge, usage chart, admin console.
- A 2–3 minute Loom walking through the owner flow then the admin flow.
- In your README: architecture diagram + text:
  > SubTrack — multi-tenant SaaS billing platform. React + TypeScript frontend on Vercel;
  > Spring Boot backend on Railway with PostgreSQL 16 (Flyway-managed), Redis usage counters,
  > JWT + Google OAuth, Razorpay test-mode billing, a JWT-resolved tenant isolation layer,
  > and a separate platform-admin console.
- Honest notes: payments run in Razorpay test mode; free-tier services may sleep after idling.

---

## 14. Troubleshooting

| Symptom | Cause → Fix |
| --- | --- |
| Backend won't start, log says `Could not resolve placeholder` | A required env var is missing → compare list in Step 4 |
| Backend won't start, log mentions `PORT` | Set `SERVER_PORT` = `${{PORT}}` |
| Migrations never ran / empty tables | Flyway ran only at first boot; recreate the Postgres service to re-run cleanly |
| Frontend shows blank page / white screen | `VITE_API_URL` not set (it was baked at build time) → set it and redeploy |
| Browser console: CORS error on every API call | `FRONTEND_URL` on Railway doesn't match your Vercel URL exactly (scheme + no slash) |
| Deep link returns 404 | `frontend/vercel.json` rewrites missing (Step 9) |
| Google button errors | Redirect URIs not exactly the two from Step 7, or consent screen not published |
| Checkout fails | Razorpay keys are in **Test Mode** and the card is test `4111 1111 1111 1111` |
| Service sleeps (slow first load) | Free/trial tiers sleep after inactivity — normal; click again |
| Trial credit ran out | Cheapest demo: one paid Railway Postgres + backend, Redis on Upstash, or a single VPS |

---

## 15. Redo / teardown

To start clean later:

- **Railway**: delete the project (kills Postgres + Redis + backend).
- **Vercel**: Remove Project.
- **Google/Razorpay**: revoke OAuth client / test keys when you stop.

Redeploying later is just `git push` (Vercel) and redeploy (Railway) — no setup again.