# SubTrack

### Multi-Tenant SaaS Subscription & Billing Platform

SubTrack is a full-stack SaaS subscription and billing platform built to simulate the core infrastructure behind modern subscription-based products.

It provides organization-based multi-tenancy, subscription plans, usage metering, automated billing, invoice management, Razorpay payments, Google OAuth2 authentication, role-based access control, and a platform-level administration console.

The project focuses heavily on backend engineering and real-world SaaS architecture rather than simple CRUD functionality.

---

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Email/password authentication
- Google OAuth2 login
- Separate organization-user and platform-admin authentication flows
- Role-based authorization
- Organization owner/admin roles
- Platform administrator role
- Tenant-aware request handling
- Protected REST APIs

### 🏢 Multi-Tenancy

- Organization-based tenant isolation
- Users belong to organizations
- Organization-scoped subscriptions
- Organization-scoped invoices and payments
- Tenant context extracted from authenticated requests
- Platform administrators can view organizations globally

### 💳 Subscription Management

- Free/trial subscription
- Paid subscription plans
- Plan upgrades
- Plan downgrades
- Subscription cancellation
- Subscription status tracking
- Billing-period tracking
- Prorated upgrade calculations
- Protection against duplicate billing operations

### 🧾 Billing & Invoicing

- Automated billing cycles
- Invoice generation
- Invoice history
- Invoice line items
- Payment status tracking
- Free plans do not generate unnecessary ₹0/$0 invoices
- Billing-cycle uniqueness protection
- Failed-payment handling
- Payment attempt tracking

### 💰 Razorpay Integration

- Razorpay order creation
- Razorpay payment checkout
- Server-side payment signature verification
- Payment persistence
- Invoice/payment state synchronization
- Payment-token support for autopay
- Webhook support
- Failed-payment/dunning handling

### 📊 Usage Metering

- Usage recording
- Current billing-period usage
- Usage limits based on subscription plan
- Daily usage breakdown
- Redis-backed usage infrastructure

### 🛡️ Platform Administration

- Dedicated platform-admin login
- Admin dashboard
- Organization overview
- Subscription overview
- MRR calculation
- Active subscription metrics
- Churn metrics
- Organization management
- Platform-level organization visibility

### 🎨 Frontend

- Responsive React UI
- Dark/light theme
- Dashboard layout
- Pricing and subscription management
- Usage dashboard
- Billing dashboard
- Organization management
- Admin dashboard
- Responsive navigation
- Modern SaaS-style interface

---

# 🏗️ Architecture

```text
                         ┌───────────────────────┐
                         │      React + Vite     │
                         │   TypeScript Frontend  │
                         └───────────┬───────────┘
                                     │
                              REST / OAuth2
                                     │
                                     ▼
                    ┌─────────────────────────────┐
                    │       Spring Boot API        │
                    │                             │
                    │  Security / JWT / OAuth2   │
                    │  Controllers / Services     │
                    │  Tenant Context             │
                    └──────────────┬──────────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ▼                  ▼                  ▼
       ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
       │   PostgreSQL   │ │     Redis      │ │    Razorpay    │
       │                │ │                │ │                │
       │ Organizations  │ │ Usage / Rate   │ │ Orders         │
       │ Users          │ │ Limiting       │ │ Payments       │
       │ Plans          │ │ Infrastructure │ │ Verification   │
       │ Subscriptions  │ │                │ │ Webhooks       │
       │ Invoices       │ │                │ │                │
       │ Payments       │ │                │ │                │
       └────────────────┘ └────────────────┘ └────────────────┘
