import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Building2,
  DollarSign,
  ShieldCheck,
  TrendingDown,
  Users,
} from "lucide-react"

import {
  getAdminMetrics,
  getAdminTenants,
} from "@/lib/api"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"

import {
  subscriptionStatusStyles,
} from "@/lib/statusStyles"

export default function AdminOverview() {
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

  if (metricsLoading || tenantsLoading) {
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
      value: `$${((metrics?.mrrCents ?? 0) / 100).toFixed(2)}`,
      icon: DollarSign,
      context: "Plans + scheduled renewals",
    },
    {
      label: "Organizations",
      value: metrics?.totalOrganizations ?? 0,
      icon: Building2,
      context: "Excludes deleted workspaces",
    },
    {
      label: "Active subscriptions",
      value: metrics?.activeSubscriptions ?? 0,
      icon: Users,
      context: "Billed this cycle",
    },
    {
      label: "Churn rate",
      value: `${metrics?.churnRatePercent ?? 0}%`,
      icon: TrendingDown,
      context: "Of all-time subscriptions",
    },
  ]

  const recentTenants = tenants?.slice(0, 4) ?? []

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        eyebrow="Platform admin"
        title="Admin console"
        description="Monitor the health of your billing platform across every organization."
        actions={
          <Button onClick={() => navigate("/admin/tenants")}>
            Manage tenants
            <ArrowRight size={15} />
          </Button>
        }
      />

      {/* METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="group p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow truncate">{stat.label}</p>

                <p className="st-tabular mt-4 text-[28px] font-semibold tracking-[-0.045em] text-[var(--st-text)]">
                  {stat.value}
                </p>
              </div>

              <div className="st-accent-chip h-9 w-9 shrink-0 rounded-lg">
                <stat.icon size={16} strokeWidth={1.9} />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[var(--st-border)] pt-3">
              <p className="text-[11px] text-[var(--st-text-faint)]">
                {stat.context}
              </p>
              <span className="st-status-dot text-[var(--success)]" />
            </div>
          </Card>
        ))}
      </div>

      {/* RECENT TENANTS */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">
              Directory
            </p>

            <h2 className="display mt-1 text-[22px]">
              Recently added organizations
            </h2>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/tenants")}
          >
            View all
            <ArrowRight size={14} />
          </Button>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="hidden grid-cols-[minmax(220px,2fr)_1fr_1fr_1fr] items-center gap-6 border-b border-[var(--st-border)] bg-[var(--st-surface-raised)] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--st-text-faint)] md:grid">
            <span>Organization</span>
            <span>Plan</span>
            <span>Status</span>
            <span>Joined</span>
          </div>

          {recentTenants.map((tenant, index) => (
            <button
              key={tenant.organizationId}
              type="button"
              onClick={() =>
                navigate(`/admin/tenants/${tenant.organizationId}`)
              }
              className="block w-full text-left"
            >
              <div
                className={`grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--st-surface-hover)] md:grid-cols-[minmax(220px,2fr)_1fr_1fr_1fr] md:items-center md:gap-6 ${
                  index !== recentTenants.length - 1
                    ? "border-b border-[var(--st-border)]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--st-border)] bg-[var(--st-surface-raised)] font-mono text-[10px] font-semibold text-[var(--st-text-muted)]">
                    {tenant.organizationName.slice(0, 2).toUpperCase()}
                  </div>

                  <span className="truncate text-sm font-medium text-[var(--st-text)]">
                    {tenant.organizationName}
                  </span>
                </div>

                <span className="hidden text-sm text-[var(--st-text-muted)] md:block">
                  {tenant.planName === "—" ? "No plan" : tenant.planName}
                </span>

                <span className="hidden md:block">
                  <Badge
                    className={
                      subscriptionStatusStyles[tenant.subscriptionStatus] ??
                      subscriptionStatusStyles.NONE
                    }
                  >
                    {tenant.subscriptionStatus}
                  </Badge>
                </span>

                <span className="hidden text-sm text-[var(--st-text-muted)] md:block">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}

          {recentTenants.length === 0 && (
            <div className="px-6 py-12 text-center">
              <ShieldCheck
                size={20}
                className="mx-auto mb-3 text-[var(--st-text-faint)]"
              />
              <p className="text-sm font-medium">
                No organizations yet
              </p>
              <p className="mt-1 text-sm text-[var(--st-text-muted)]">
                New workspaces will appear here.
              </p>
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}