import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"

import { ThemeToggle } from "@/components/ui/theme-toggle"

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  const navigate = useNavigate()

  const mark = (
    <span className="flex items-center gap-2.5">
      <span className="st-logo-mark st-logo-glyph h-8 w-8 rounded-lg text-[14px]">
        S
      </span>

      <span className="display text-[19px]">SubTrack</span>
    </span>
  )

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-[var(--border)] p-12 lg:flex">
        {/* Single soft top-light */}
        <div
          className="pointer-events-none absolute -top-40 right-[-10%] h-[420px] w-[420px] rounded-full bg-[var(--accent-gradient-soft)] blur-3xl"
          aria-hidden
        />

        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-left"
        >
          {mark}
        </button>

        <div className="relative max-w-md">
          <p className="eyebrow mb-6">
            Billing OS
          </p>

          <p className="display text-[46px] leading-[1.02] tracking-[-0.04em]">
            Billing infrastructure
            <br />
            <span className="st-gradient-text">
              for multi-tenant SaaS
            </span>
          </p>

          <p className="mt-5 text-[var(--text-muted)]">
            Subscriptions, usage metering, invoices, and
            signed payment workflows — isolated per organization.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              ["Tenant isolation", "JWT-resolved"],
              ["Usage counters", "Redis atomic"],
              ["Invoicing", "Scheduled"],
              ["Webhooks", "HMAC signed"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] p-4 shadow-[inset_0_1px_0_var(--edge)] transition-colors hover:border-[var(--accent-border)]"
              >
                <p className="eyebrow">
                  {label}
                </p>

                <p className="mt-1.5 text-sm font-medium">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="eyebrow">
          Spring Boot · PostgreSQL · Redis · React
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="lg:hidden"
            >
              {mark}
            </button>

            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>

          <div>
            <h1 className="display text-[36px]">
              {title}
            </h1>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {subtitle}
            </p>
          </div>

          {children}

          <div className="border-t border-[var(--border)] pt-5 text-sm text-[var(--text-muted)]">
            {footer}
          </div>
        </div>
      </section>
    </div>
  )
}
