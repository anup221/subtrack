import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  Building2,
  DollarSign,
  Search,
  TrendingDown,
  Users,
} from "lucide-react"

import {
  getAdminMetrics,
  getAdminTenants,
} from "@/lib/api"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"

import {
  subscriptionStatusStyles,
} from "@/lib/statusStyles"

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function AdminOverview() {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  const {
    data: metrics,
    isLoading: metricsLoading,
  } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: getAdminMetrics,
  })

  const {
    data: tenants,
    isLoading: tenantsLoading,
  } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: getAdminTenants,
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) return tenants ?? []

    return (tenants ?? []).filter(
      (tenant) =>
        tenant.organizationName
          .toLowerCase()
          .includes(q) ||
        tenant.planName
          .toLowerCase()
          .includes(q) ||
        tenant.subscriptionStatus
          .toLowerCase()
          .includes(q)
    )
  }, [tenants, query])

  if (
    metricsLoading ||
    tenantsLoading
  ) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-32 animate-pulse rounded bg-[var(--st-surface-hover)]" />
        <div className="h-12 w-72 animate-pulse rounded bg-[var(--st-surface-hover)]" />
      </div>
    )
  }

  const stats = [
    {
      label: "Monthly recurring revenue",
      shortLabel: "MRR",
      value: `$${(
        (metrics?.mrrCents ?? 0) /
        100
      ).toFixed(2)}`,
      icon: DollarSign,
    },
    {
      label: "Organizations",
      shortLabel: "Organizations",
      value:
        metrics?.totalOrganizations ?? 0,
      icon: Building2,
    },
    {
      label: "Active subscriptions",
      shortLabel: "Active subscriptions",
      value:
        metrics?.activeSubscriptions ?? 0,
      icon: Users,
    },
    {
      label: "Churn rate",
      shortLabel: "Churn rate",
      value: `${metrics?.churnRatePercent ?? 0}%`,
      icon: TrendingDown,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-12">

      <PageHeader
        eyebrow="Platform admin"
        title="Admin console"
        description="Monitor the health of your billing platform across every organization."
      />

      {/* METRICS */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        {stats.map((stat) => (
          <Card key={stat.label}>

            <div className="flex items-start justify-between">

              <div>

                <p className="eyebrow">
                  {stat.shortLabel}
                </p>

                <p className="mt-5 text-3xl font-semibold tracking-[-0.045em]">
                  {stat.value}
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--st-border)] bg-[var(--st-surface-raised)]">

                <stat.icon
                  size={16}
                  className="text-[var(--st-action)]"
                />

              </div>

            </div>

          </Card>
        ))}

      </div>

      {/* DIRECTORY */}

      <section>

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <p className="eyebrow">
              Directory
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
              All tenants
            </h2>

            <p className="mt-1 text-sm text-[var(--st-text-muted)]">
              {filtered.length} organization
              {filtered.length === 1
                ? ""
                : "s"}{" "}
              shown
            </p>

          </div>

          <div className="relative w-full lg:w-72">

            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--st-text-faint)]"
            />

            <Input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search organizations..."
              className="h-10 pl-9"
            />

          </div>

        </div>

        <Card className="overflow-hidden p-0">

          {/* HEADER */}

          <div className="hidden grid-cols-[minmax(220px,2fr)_1fr_1fr_1fr] border-b border-[var(--st-border)] bg-[var(--st-surface-raised)] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--st-text-faint)] md:grid">

            <span>Organization</span>
            <span>Plan</span>
            <span>Status</span>
            <span>Joined</span>

          </div>

          {/* ROWS */}

          {filtered.map((tenant) => (

            <div
              key={tenant.organizationId}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/admin/tenants/${tenant.organizationId}`)}
              onKeyDown={(event) => { if (event.key === "Enter") navigate(`/admin/tenants/${tenant.organizationId}`) }}
              className="grid gap-3 border-b border-[var(--st-border)] px-5 py-4 last:border-0 hover:bg-[var(--st-surface-hover)] md:grid-cols-[minmax(220px,2fr)_1fr_1fr_1fr] md:items-center"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--st-border)] bg-[var(--st-surface-raised)] text-xs font-semibold">
                  {initials(
                    tenant.organizationName
                  )}
                </div>

                <div>

                  <p className="text-sm font-medium">
                    {tenant.organizationName}
                  </p>

                  <p className="mt-0.5 font-mono text-[10px] text-[var(--st-text-faint)]">
                    {tenant.organizationId.slice(
                      0,
                      8
                    )}
                    ...
                  </p>

                </div>

              </div>

              <div className="flex items-center justify-between md:block">

                <span className="text-xs uppercase tracking-[0.1em] text-[var(--st-text-faint)] md:hidden">
                  Plan
                </span>

                <span className="text-sm">
                  {tenant.planName === "NONE"
                    ? "—"
                    : tenant.planName}
                </span>

              </div>

              <div className="flex items-center justify-between md:block">

                <span className="text-xs uppercase tracking-[0.1em] text-[var(--st-text-faint)] md:hidden">
                  Status
                </span>

                <Badge
                  className={
                    subscriptionStatusStyles[
                      tenant.subscriptionStatus
                    ] ??
                    subscriptionStatusStyles.NONE
                  }
                >
                  {tenant.subscriptionStatus}
                </Badge>

              </div>

              <div className="flex items-center justify-between md:block">

                <span className="text-xs uppercase tracking-[0.1em] text-[var(--st-text-faint)] md:hidden">
                  Joined
                </span>

                <span className="text-sm text-[var(--st-text-muted)]">
                  {new Date(
                    tenant.createdAt
                  ).toLocaleDateString()}
                </span>

              </div>

            </div>

          ))}

          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center">

              <p className="text-sm font-medium">
                No organizations found
              </p>

              <p className="mt-1 text-sm text-[var(--st-text-muted)]">
                Try a different organization,
                plan, or status.
              </p>

            </div>
          )}

        </Card>

      </section>

    </div>
  )
}
