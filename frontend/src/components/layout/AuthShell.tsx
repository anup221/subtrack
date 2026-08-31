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
      <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--action)] font-mono text-[13px] font-medium text-[var(--action-text)]">
        S
      </span>

      <span className="display text-[18px]">
        SubTrack
      </span>
    </span>
  )

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between border-r border-[var(--border)] bg-[var(--bg-elevated)] p-12 lg:flex">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-left"
        >
          {mark}
        </button>

        <div className="max-w-md">
          <p className="eyebrow mb-6">
            Billing OS
          </p>

          <p className="display text-[44px] leading-[1.04]">
            Billing infrastructure
            <br />
            for multi-tenant SaaS
          </p>

          <p className="mt-5 text-[var(--text-muted)]">
            Subscriptions, usage metering, invoices, and
            signed payment workflows — isolated per organization.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)]">
            {[
              ["Tenant isolation", "JWT-resolved"],
              ["Usage counters", "Redis atomic"],
              ["Invoicing", "Scheduled"],
              ["Webhooks", "HMAC signed"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="bg-[var(--surface)] px-5 py-4"
              >
                <p className="eyebrow">
                  {label}
                </p>

                <p className="mt-1 text-sm">
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
