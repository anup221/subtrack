🧩 Backend Architecture

The Spring Boot backend is organized around business domains.

subtrack/src/main/java/com/subtrack/subtrack/

├── admin/
│   ├── AdminController
│   ├── AdminService
│   └── dto/
│
├── auth/
│   ├── AuthController
│   ├── AuthService
│   ├── JwtService
│   ├── JwtAuthFilter
│   ├── OAuthSuccessHandler
│   └── dto/
│
├── billing/
│   ├── BillingController
│   ├── BillingService
│   ├── BillingCycleJob
│   ├── Invoice
│   ├── InvoiceRepository
│   └── dto/
│
├── config/
│   └── SecurityConfig
│
├── organization/
│   ├── Organization
│   ├── OrganizationController
│   ├── OrganizationService
│   └── OrganizationRepository
│
├── payment/
│   ├── RazorpayService
│   ├── RazorpayController
│   ├── Payment
│   ├── PaymentRepository
│   ├── AutopayService
│   └── DunningService
│
├── plan/
│   ├── Plan
│   ├── PlanService
│   └── PlanRepository
│
├── subscription/
│   ├── Subscription
│   ├── SubscriptionService
│   ├── SubscriptionController
│   └── SubscriptionRepository
│
├── tenant/
│   └── TenantContext
│
├── usage/
│   ├── UsageController
│   ├── UsageService
│   └── dto/
│
├── user/
│   ├── User
│   ├── UserRepository
│   └── UserRole
│
└── webhook/
    └── WebhookController
🖥️ Frontend Architecture
frontend/

├── src/
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardHome.tsx
│   │   ├── PricingPage.tsx
│   │   ├── UsagePage.tsx
│   │   ├── BillingPage.tsx
│   │   ├── OrganizationPage.tsx
│   │   ├── AdminLoginPage.tsx
│   │   ├── AdminOverview.tsx
│   │   └── OAuthCompletePage.tsx
│   │
│   ├── store/
│   │   └── appStore.ts
│   │
│   ├── router.tsx
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
└── vite.config.ts
🔄 Subscription Lifecycle

A subscription follows a controlled lifecycle.

                 ┌──────────────┐
                 │    TRIAL     │
                 └──────┬───────┘
                        │
                  Select paid plan
                        │
                        ▼
                 ┌──────────────┐
                 │   PAYMENT    │
                 │   REQUIRED   │
                 └──────┬───────┘
                        │
                 Razorpay payment
                        │
                        ▼
                Verify signature
                        │
                        ▼
                 ┌──────────────┐
                 │    ACTIVE    │
                 └──────┬───────┘
                        │
              ┌─────────┴─────────┐
              │                   │
          Upgrade             Downgrade
              │                   │
              ▼                   ▼
       Prorated payment      New plan state
              │
              ▼
          ACTIVE
              │
              ▼
          Cancel
              │
              ▼
         CANCELED
📈 Plan Upgrades

SubTrack supports prorated upgrades.

When a customer moves from a cheaper paid plan to a more expensive plan during an active billing period, the system calculates the remaining value of the current subscription.

Conceptually:

Unused value of current plan
             ↓
      ┌──────────────┐
      │              │
      │    Credit    │
      │              │
      └──────┬───────┘
             │
             ▼
Cost of new plan for remaining period
             │
             ▼
      Amount to pay now

The customer is not charged the full new-plan price again when only a prorated difference is due.

🧾 Billing Architecture

Monthly billing is handled through a scheduled billing process.

Scheduled Billing Job
        │
        ▼
Find active/trial subscriptions
        │
        ▼
Check billing-cycle record
        │
        ├──── Already billed ────► Skip
        │
        ▼
Determine current plan
        │
        ├──── Free plan ─────────► Skip $0 invoice
        │
        ▼
Generate invoice
        │
        ▼
Persist billing-cycle record
        │
        ▼
Autopay enabled?
        │
        ├──── No ────────────────► Await payment
        │
        ▼
Attempt Razorpay autopay

A database uniqueness constraint on the organization/billing period provides an additional safeguard against duplicate billing.

💳 Payment Flow
Frontend
   │
   │ Create payment request
   ▼
Spring Boot
   │
   │ Create Razorpay Order
   ▼
Razorpay
   │
   │ Checkout
   ▼
Customer
   │
   │ Payment
   ▼
Razorpay
   │
   │ Payment response
   ▼
Frontend
   │
   │ Send payment details
   ▼
Spring Boot
   │
   │ Verify Razorpay signature
   ▼
Payment verified?
   │
   ├──────── No ────────► FAILED
   │
   ▼
Persist successful payment
   │
   ▼
Mark invoice PAID
   │
   ▼
Activate subscription

The server remains responsible for payment verification.

🔐 Security Model

SubTrack uses two main authentication domains.

Organization Users

Organization users authenticate through:

Email + Password
       OR
Google OAuth2
       ↓
JWT
       ↓
Organization-scoped session

JWT claims contain information required to identify the authenticated organization and user role.

Platform Administrators

Platform administrators use a separate authentication path:

Admin Login
     OR
Admin Google OAuth2
     ↓
Platform Admin JWT
     ↓
ROLE_PLATFORM_ADMIN
     ↓
Admin Console

Platform administrators are not assigned an organization tenant context.

🏢 Tenant Isolation

Organization requests are resolved through the authenticated tenant context.

Conceptually:

Request
   │
   ▼
JWT
   │
   ├── User
   ├── Role
   └── Organization ID
          │
          ▼
    TenantContext
          │
          ▼
Organization-scoped data

This prevents one organization from accessing another organization's subscriptions, invoices, usage data, or payments.

🛠️ Tech Stack
Category	Technology
Backend	Java 25
Framework	Spring Boot
Security	Spring Security
Authentication	JWT + OAuth2
ORM	Spring Data JPA / Hibernate
Database	PostgreSQL
Migrations	Flyway
Cache / Infrastructure	Redis
Payments	Razorpay
API	REST
API Documentation	OpenAPI / Swagger
Frontend	React
Language	TypeScript
Build Tool	Vite
Styling	Tailwind CSS
State	Zustand
HTTP Client	Axios
Containers	Docker / Docker Compose
🗄️ Database

PostgreSQL is used as the primary persistent datastore.

Major domain entities include:

Organization
     │
     ├── User
     │
     └── Subscription
              │
              ├── Plan
              │
              └── Invoice
                       │
                       └── Payment

Usage
     │
     └── Organization

Database schema changes are managed through Flyway migrations.

Hibernate is configured for schema validation rather than automatic schema creation.

⚡ Redis

Redis is used for high-frequency infrastructure such as usage metering and rate-limiting related operations.

This prevents high-volume usage operations from unnecessarily depending on PostgreSQL for every request.

👨‍💼 Platform Admin

The platform administration console provides visibility into organizations using the SaaS platform.

Administrators can view:

Total organizations
Active subscriptions
Subscription plans
Subscription status
MRR
Churn information
Organization information

The platform-admin area is intentionally separated from normal organization users.

📸 Screenshots

Screenshots are stored under:

assets/screenshots/

Recommended screenshots:

Landing Page

Login

Dashboard

Pricing & Plans

Usage

Billing

Platform Admin

Organization Management

🚀 Running Locally
Prerequisites

Install:

JDK 25
Node.js
pnpm
Docker
Docker Compose

You will also need development credentials for:

Google OAuth2
Razorpay
1. Clone
git clone https://github.com/anup221/subtrack.git

cd subtrack
2. Start Infrastructure
docker compose up -d

This starts the infrastructure required by the application.

3. Configure Backend

Create/configure the required environment variables.

Example:

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

JWT_SECRET=your-long-random-jwt-secret

RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

ADMIN_BOOTSTRAP_CODE=your-admin-bootstrap-code

Never commit these values to Git.

4. Start Backend

Windows:

cd subtrack
mvnw.cmd spring-boot:run

Linux/macOS:

cd subtrack
./mvnw spring-boot:run

Backend:

http://localhost:8080
5. Start Frontend
cd frontend

pnpm install

pnpm dev

Frontend:

http://localhost:5173
📚 API Documentation

When OpenAPI is enabled, Swagger UI is available at:

http://localhost:8080/swagger-ui/index.html

This provides an interactive interface for exploring the REST API.

🔑 OAuth2 Configuration

For local Google authentication, configure the following redirect URIs in Google Cloud:

http://localhost:8080/login/oauth2/code/google-org

and:

http://localhost:8080/login/oauth2/code/google-admin

The OAuth flow is handled by the Spring Boot backend before the authenticated session is returned to the frontend.

🐳 Docker

The project includes Docker configuration for local development.

The recommended development setup is:

React
  │
  ▼
Spring Boot
  │
  ├── PostgreSQL
  │
  └── Redis

Razorpay and Google OAuth remain external services.

🧪 Testing

Backend tests can be executed with:

./mvnw test

Windows:

mvnw.cmd test

Frontend production build:

pnpm build
📁 Repository Structure
subtrack/
│
├── assets/
│   └── screenshots/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── subtrack/
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   │
│   ├── pom.xml
│   ├── Dockerfile
│   └── docker-compose.full.yml
│
├── docker-compose.yml
├── README.md
└── .gitignore
🔒 Production Considerations

Before deploying to production:

Use environment variables/secrets management
Rotate all development credentials
Generate a strong JWT signing secret
Configure HTTPS
Restrict CORS to trusted frontend domains
Configure production Google OAuth redirect URIs
Use Razorpay production credentials only in the deployment environment
Configure Razorpay webhook verification
Use database backups
Configure Redis securely
Disable verbose SQL logging
Configure centralized logging
Add monitoring and alerting
Add rate limiting to authentication endpoints
Protect administrative endpoints with platform-admin authorization
Never commit credentials to source control
💡 Engineering Highlights

This project demonstrates several backend concepts relevant to production SaaS systems:

Multi-tenant architecture
Tenant-aware authorization
JWT authentication
OAuth2 integration
Role-based access control
Subscription lifecycle management
Trial subscriptions
Subscription upgrades and downgrades
Prorated billing
Automated billing cycles
Invoice lifecycle management
Payment verification
Razorpay integration
Payment-token/autopay support
Webhook processing
Idempotency and duplicate-billing protection
Redis-backed usage metering
PostgreSQL persistence
Flyway database migrations
Scheduled background jobs
Dockerized infrastructure
REST API architecture
