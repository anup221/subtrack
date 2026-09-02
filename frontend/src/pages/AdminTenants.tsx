import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"

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

export default function AdminTenants() {
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

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="Platform admin"
        title="All tenants"
        description="Browse, inspect, and manage every organization on the platform."
      />

      {/* SUMMARY STRIP */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow">Organizations</p>
              <p className="st-tabular mt-4 text-[26px] font-semibold tracking-[-0.04em]">
                {metrics?.totalOrganizations ?? 0}
              </p>
            </div>
            <span className="st-status-dot text-[var(--accent)]" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow">Active subscriptions</p>
              <p className="st-tabular mt-4 text-[26px] font-semibold tracking-[-0.04em]">
                {metrics?.activeSubscriptions ?? 0}
              </p>
            </div>
            <span className="st-status-dot text-[var(--success)]" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow">MRR</p>
              <p className="st-tabular mt-4 text-[26px] font-semibold tracking-[-0.04em]">
                ${((metrics?.mrrCents ?? 0) / 100).toFixed(2)}
              </p>
            </div>
            <span className="st-status-dot text-[var(--warning)]" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow">Churn rate</p>
              <p className="st-tabular mt-4 text-[26px] font-semibold tracking-[-0.04em]">
                {metrics?.churnRatePercent ?? 0}%
              </p>
            </div>
            <span className="st-status-dot text-[var(--danger)]" />
          </div>
        </Card>
      </div>

      {/* SEARCH */}
      <div className="relative w-full sm:w-80">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--st-text-faint)]"
        />

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search organizations..."
          className="h-10 pl-9"
        />
      </div>

      {/* DIRECTORY */}
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
            onKeyDown={(event) => {
              if (event.key === "Enter") navigate(`/admin/tenants/${tenant.organizationId}`)
            }}
            className="grid gap-3 border-b border-[var(--st-border)] px-5 py-4 last:border-0 hover:bg-[var(--st-surface-hover)] md:grid-cols-[minmax(220px,2fr)_1fr_1fr_1fr] md:items-center"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--st-border)] bg-[var(--st-surface-raised)] text-xs font-semibold">
                {initials(tenant.organizationName)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {tenant.organizationName}
                  </p>

                  {tenant.organizationStatus === "BLOCKED" && (
                    <Badge className="bg-[var(--danger)] text-white">
                      Blocked
                    </Badge>
                  )}
                </div>

                <p className="mt-0.5 font-mono text-[10px] text-[var(--st-text-faint)]">
                  {tenant.organizationId.slice(0, 8)}...
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between md:block">
              <span className="text-xs uppercase tracking-[0.1em] text-[var(--st-text-faint)] md:hidden">
                Plan
              </span>

              <span className="text-sm">
                {tenant.planName === "NONE" ? "—" : tenant.planName}
              </span>
            </div>

            <div className="flex items-center justify-between md:block">
              <span className="text-xs uppercase tracking-[0.1em] text-[var(--st-text-faint)] md:hidden">
                Status
              </span>

              <Badge
                className={
                  subscriptionStatusStyles[tenant.subscriptionStatus] ??
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
                {new Date(tenant.createdAt).toLocaleDateString()}
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
              Try a different organization, plan, or status.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}