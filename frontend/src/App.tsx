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
    <div className="min-h-screen bg-[var(--st-bg)] text-[var(--st-text)]">

      {/* NAVIGATION */}

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">

        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--st-text)] text-[var(--st-bg)]">
            <span className="font-serif text-lg">
              S
            </span>
          </div>

          <div className="text-left">
            <div className="text-sm font-semibold">
              SubTrack
            </div>

            <div className="eyebrow mt-1 hidden sm:block">
              Billing infrastructure
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">

          <Button
            variant="ghost"
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
      </nav>

      {/* HERO */}

      <section className="mx-auto max-w-7xl px-6 pb-28 pt-20 md:px-10 md:pt-28">

        <div className="max-w-5xl">

          <div className="mb-7 flex items-center gap-3">
            <div className="h-px w-8 bg-[var(--st-accent)]" />

            <span className="eyebrow text-[var(--st-accent)]">
              SaaS billing infrastructure
            </span>
          </div>

          <h1 className="display text-6xl leading-[0.92] sm:text-7xl md:text-8xl lg:text-9xl">
            Billing
            <br />
            <span className="text-[var(--st-text-muted)]">
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
                <Check
                  size={13}
                  className="text-[var(--st-accent)]"
                />

                {item}
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* STATEMENT */}

      <section className="border-y border-[var(--st-border)] bg-[var(--st-surface)]">

        <div className="mx-auto grid max-w-7xl md:grid-cols-3">

          <div className="border-b border-[var(--st-border)] p-8 md:border-b-0 md:border-r md:p-10">
            <span className="eyebrow">
              The idea
            </span>

            <h2 className="display mt-5 text-3xl leading-tight">
              Make the complex parts feel simple.
            </h2>
          </div>

          <div className="border-b border-[var(--st-border)] p-8 md:border-b-0 md:border-r md:p-10">
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
            <div className="h-px w-8 bg-[var(--st-accent)]" />

            <span className="eyebrow">
              Built for the real thing
            </span>
          </div>

          <h2 className="display text-5xl leading-none md:text-6xl">
            Everything your billing layer needs.
          </h2>

        </div>

        <div className="grid overflow-hidden border border-[var(--st-border)] md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <article
                key={feature.title}
                className="group border-b border-r border-[var(--st-border)] bg-[var(--st-surface)] p-8 transition-colors duration-200 hover:bg-[var(--st-surface-hover)]"
              >

                <div className="flex items-start justify-between">

                  <span className="mono text-[10px] text-[var(--st-text-faint)]">
                    {feature.number}
                  </span>

                  <Icon
                    size={19}
                    strokeWidth={1.7}
                    className="text-[var(--st-accent)] transition-transform duration-200 group-hover:scale-110"
                  />

                </div>

                <h3 className="mt-14 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[var(--st-text-muted)]">
                  {feature.description}
                </p>

                <div className="mt-8 h-px w-0 bg-[var(--st-accent)] transition-all duration-300 group-hover:w-10" />

              </article>
            )
          })}

        </div>

      </section>

      {/* CTA */}

      <section className="mx-auto max-w-7xl px-6 pb-28 md:px-10">

        <div className="border border-[var(--st-border)] bg-[var(--st-surface)] p-8 md:p-14">

          <span className="eyebrow text-[var(--st-accent)]">
            Start with SubTrack
          </span>

          <h2 className="display mt-6 max-w-3xl text-5xl leading-none md:text-7xl">
            Build the billing layer
            your product deserves.
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

      </section>

      {/* FOOTER */}

      <footer className="border-t border-[var(--st-border)]">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">

          <div>
            <p className="text-sm font-semibold">
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