# SubTrack production-readiness report

## Completed changes

- Paid upgrades are now staged: selecting an upgrade calculates the remaining-period charge and creates one pending invoice, but leaves the current plan and subscription status unchanged.
- The frontend sends the customer directly to that invoice's Razorpay checkout. A verified Razorpay callback is the only path that activates the staged plan.
- Downgrades are allowed without a payment or invoice. A subscription with a pending paid change cannot be changed again until that invoice is resolved, preventing an old checkout from activating the wrong plan.
- Free plans cannot create invoices. The recurring billing job already records a skipped free cycle; the manual invoice endpoint was removed so it cannot create a $0 invoice.
- Invoice/order/payment idempotency is persisted. There is one open plan-change invoice per organization, one Razorpay order per invoice, and a gateway payment ID can be stored only once.
- Razorpay verification confirms that the callback order ID is the order created for that exact invoice before marking it paid. Replayed successful callbacks return the original payment rather than creating another one.
- Google organization login is visible on the normal login page. OAuth completion now distinguishes organization and platform-admin tokens instead of routing every Google login to admin.
- Admin login now supports first-admin signup using the bootstrap code. The admin directory links to organization details, and the details screen supports block/unblock and soft removal (status `DELETED`, preserving financial records).
- Credentials have been removed from application configuration and CORS is configured from the deployed frontend URL.

## Required deployment configuration

Set these secrets in the deployment platform; do not commit them:

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Random 32+ byte JWT signing secret |
| `WEBHOOK_SECRET` | HMAC secret for the existing generic webhook endpoint |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay production API credentials |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret, if Razorpay webhooks are enabled |
| `GOOGLE_ORG_CLIENT_ID` / `GOOGLE_ORG_CLIENT_SECRET` | Google OAuth credentials for organization sign-in |
| `GOOGLE_ADMIN_CLIENT_ID` / `GOOGLE_ADMIN_CLIENT_SECRET` | Optional separate Google OAuth credentials for admins |
| `ADMIN_BOOTSTRAP_CODE` | One-time protected code used to create the first platform admin |
| `FRONTEND_URL` | Exact public frontend origin, e.g. `https://app.example.com` |

In Google Cloud, add both callback URLs: `https://<api-host>/login/oauth2/code/google-org` and `https://<api-host>/login/oauth2/code/google-admin`.

## Database and rollout

Deploy the backend with Flyway enabled. Migration `V8__payment_safe_plan_changes.sql` adds pending-plan state, gateway-order fields, and database uniqueness protections. Existing subscriptions remain on their current plan; no data backfill is required.

The mock `/api/payments/pay/{invoiceId}` endpoint still exists for development compatibility. Do not expose or use it in the production frontend; production checkout uses `/api/payments/razorpay/*` only. Keep the platform-admin billing-cycle trigger `/api/invoices/run-cycle` on an internal network or remove it from the production profile.

## Verification performed

- `pnpm build` completed successfully and emitted the production frontend bundle.
- `mvn -s .mvn/settings.xml test -q` completed successfully. The included Maven settings make the local repository writable in this workspace.

`pnpm lint` still reports pre-existing React fast-refresh/component-structure rules and two effect-state warnings in legacy pages. These do not block the production TypeScript build, but should be cleaned up as a separate frontend hygiene task.
