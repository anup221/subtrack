import {
  ArrowRight,
  BarChart3,
  Check,
  CircleDollarSign,
  Receipt,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react"

import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const features = [
  {
    icon: Users,
    number: "01",
    title: "Multi-tenant by design",
    description:
      "Every organization gets an isolated billing workspace with tenant-aware permissions.",
  },
  {
    icon: Zap,
    number: "02",
    title: "Usage that stays honest",
    description:
      "Meter API consumption and keep subscription limits visible in real time.",
  },
  {
    icon: Receipt,
    number: "03",
    title: "Invoices without busywork",
    description:
      "Generate clear invoices from recurring plans and metered usage.",
  },
  {
    icon: CircleDollarSign,
    number: "04",
    title: "Payments built in",
    description:
      "Connect invoice settlement to payment attempts and Razorpay checkout.",
  },
  {
    icon: BarChart3,
    number: "05",
    title: "One clear control plane",
    description:
      "Owners manage their workspace while platform admins see the bigger picture.",
  },
  {
    icon: ShieldCheck,
    number: "06",
    title: "Recovery and control",
    description:
      "Keep subscriptions, payments, invoices, and billing history consistent.",
  },
]

export default function App() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--st-bg)] text-[var(--st-text)]">

      {/* AMBIENT LIGHT (subtle, static) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px]"
        aria-hidden
        style={{
          background:
            "radial-gradient(58% 55% at 50% 0%, var(--accent-2) 0%, transparent 68%)",
          opacity: 0.09,
        }}
      />

      {/* NAVIGATION */}

      <nav className="sticky top-0 z-50 bg-[color-mix(in_srgb,var(--background)_78%,transparent)] backdrop-blur-xl">
        <div className="border-b border-[var(--border)]/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-3"
            >
              <div className="st-logo-mark st-logo-glyph h-9 w-9 rounded-xl text-base">
                S
              </div>

              <div className="text-left">
                <div className="display text-[15px] tracking-[-0.02em]">
                  SubTrack
                </div>

                <div className="eyebrow mt-1 hidden sm:block">
                  Billing infrastructure
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2">

              <ThemeToggle />

              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                onClick={() => navigate("/login")}
              >
                Log in
              </Button>

              <Button
                onClick={() => navigate("/signup")}
              >
                Get started
                <ArrowRight size={15} />
              </Button>

            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}

      <section className="mx-auto max-w-7xl px-6 pb-28 pt-20 md:px-10 md:pt-28">

        <div className="max-w-5xl">

          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[var(--accent-soft)] px-4 py-1.5 shadow-[0_8px_24px_-10px_color-mix(in_srgb,var(--accent)_45%,transparent)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />

            <span className="eyebrow text-[var(--accent)]">
              SaaS billing infrastructure
            </span>
          </div>

          <h1 className="display text-6xl leading-[0.94] sm:text-7xl md:text-8xl lg:text-9xl">
            Billing
            <br />
            <span className="st-gradient-text">
              without the noise.
            </span>
          </h1>

          <p className="mt-9 max-w-2xl text-base leading-8 text-[var(--st-text-muted)] md:text-lg">
            SubTrack gives SaaS teams a focused system for
            subscriptions, usage metering, invoices, and
            payments — all from one clean control plane.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">

            <Button
              size="lg"
              onClick={() => navigate("/signup")}
            >
              Start building
              <ArrowRight size={16} />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>

          </div>

          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--st-border)] pt-6">

            {[
              "Tenant isolation",
              "Usage metering",
              "Invoice generation",
              "Razorpay payments",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-xs text-[var(--st-text-muted)]"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-soft)]">
                  <Check
                    size={10}
                    strokeWidth={3}
                    className="text-[var(--accent)]"
                  />
                </span>

                {item}
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* STATEMENT */}

      <section className="border-y border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] backdrop-blur-sm">

        <div className="mx-auto grid max-w-7xl md:grid-cols-3">

          <div className="border-b border-[var(--border)] p-8 md:border-b-0 md:border-r md:p-10">
            <span className="eyebrow">
              The idea
            </span>

            <h2 className="display mt-5 text-[28px] leading-tight tracking-[-0.03em] md:text-3xl">
              Make the complex parts
              <br className="hidden md:block" />
              {" "}feel <span className="st-gradient-text">simple.</span>
            </h2>
          </div>

          <div className="border-b border-[var(--border)] p-8 md:border-b-0 md:border-r md:p-10">
            <span className="eyebrow">
              For developers
            </span>

            <p className="mt-5 text-sm leading-7 text-[var(--st-text-muted)]">
              Clean APIs, predictable billing state,
              usage limits, and explicit payment flows.
            </p>
          </div>

          <div className="p-8 md:p-10">
            <span className="eyebrow">
              For operators
            </span>

            <p className="mt-5 text-sm leading-7 text-[var(--st-text-muted)]">
              Clear subscription state, invoices,
              payment history, and organization-level
              visibility.
            </p>
          </div>

        </div>

      </section>

      {/* FEATURES */}

      <section className="mx-auto max-w-7xl px-6 py-28 md:px-10">

        <div className="mb-14 max-w-2xl">

          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-[var(--accent-gradient)]" />

            <span className="eyebrow">
              Built for the real thing
            </span>
          </div>

          <h2 className="display text-[40px] leading-[1.02] tracking-[-0.04em] md:text-[54px]">
            Everything your billing layer needs.
          </h2>

        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <article
                key={feature.title}
                className="group relative overflow-hidden rounded-xl border border-[var(--st-border)] bg-[var(--st-surface)] p-7 shadow-[inset_0_1px_0_var(--edge),var(--st-shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--accent-border)] hover:shadow-[inset_0_1px_0_var(--edge),var(--st-shadow-md)]"
              >

                <div className="relative flex items-start justify-between">

                  <span className="mono text-[10px] text-[var(--st-text-faint)]">
                    {feature.number}
                  </span>

                  <span className="st-accent-chip h-10 w-10 rounded-lg">
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className="transition-transform duration-200 group-hover:scale-110"
                    />
                  </span>

                </div>

                <h3 className="mt-14 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[var(--st-text-muted)]">
                  {feature.description}
                </p>

                <div className="mt-8 h-px w-0 bg-[var(--accent-gradient)] transition-all duration-300 group-hover:w-10" />

              </article>
            )
          })}

        </div>

      </section>

      {/* CTA */}

      <section className="mx-auto max-w-7xl px-6 pb-28 md:px-10">

        <div className="relative overflow-hidden rounded-2xl border border-[var(--accent-border)] bg-[var(--st-surface)] p-8 shadow-[inset_0_1px_0_var(--edge),var(--st-shadow-md)] md:p-14">

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[40%] bg-[var(--accent-gradient-soft)] blur-2xl"
            aria-hidden
          />

          <div className="relative">
            <span className="eyebrow text-[var(--accent)]">
              Start with SubTrack
            </span>

            <h2 className="display mt-6 max-w-3xl text-[40px] leading-[1.02] tracking-[-0.04em] md:text-6xl">
              Build the billing layer
              <br className="hidden md:block" />
              {" "}your product deserves.
            </h2>

            <div className="mt-8">

              <Button
                size="lg"
                onClick={() => navigate("/signup")}
              >
                Create your workspace
                <ArrowRight size={16} />
              </Button>

            </div>
          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-[var(--border)]">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">

          <div>
            <p className="display text-[15px] tracking-[-0.02em]">
              SubTrack
            </p>

            <p className="mt-1 text-xs text-[var(--st-text-faint)]">
              Multi-tenant SaaS billing infrastructure.
            </p>
          </div>

          <p className="mono text-[9px] uppercase tracking-wider text-[var(--st-text-faint)]">
            React · TypeScript · Spring Boot · PostgreSQL
          </p>

        </div>

      </footer>

    </div>
  )
}