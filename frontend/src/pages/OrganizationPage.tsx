import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  Building2,
  Calendar,
  Copy,
  Gauge,
  ArrowRight,
} from "lucide-react"

import {
  getCurrentSubscription,
  getInvoices,
  getUsageSummary,
} from "@/lib/api"

import { useAppStore } from "@/store/appStore"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"

import {
  paymentStatusStyles,
  subscriptionStatusStyles,
} from "@/lib/statusStyles"

export default function OrganizationPage() {
  const navigate = useNavigate()

  const email = useAppStore((s) => s.email)
  const role = useAppStore((s) => s.role)
  const organizationId = useAppStore(
    (s) => s.organizationId
  )

  const {
    data: subscription,
    isLoading: subLoading,
    isError: subError,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: getCurrentSubscription,
    retry: false,
  })

  const {
    data: summary,
    isLoading: usageLoading,
  } = useQuery({
    queryKey: ["usage-summary"],
    queryFn: getUsageSummary,
  })

  const {
    data: invoices,
    isLoading: invoicesLoading,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  })

  if (
    subLoading ||
    usageLoading ||
    invoicesLoading
  ) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-32 animate-pulse rounded bg-[var(--st-surface-hover)]" />
        <div className="h-12 w-72 animate-pulse rounded bg-[var(--st-surface-hover)]" />
      </div>
    )
  }

  if (subError || !subscription) {
    return (
      <div className="mx-auto max-w-6xl pb-12">
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col items-start gap-3 p-8 sm:flex-row sm:items-center">
            <div>
              <p className="text-base font-medium text-[var(--st-text)]">
                No active subscription found
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--st-text-muted)]">
                This workspace doesn't have a subscription yet.
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const percentUsed = summary
    ? Math.min(
        100,
        Math.round(
          (summary.currentPeriodUsage /
            summary.maxUsage) *
            100
        )
      )
    : 0

  const recentInvoices =
    invoices?.slice(0, 3) ?? []

  async function copyOrgId() {
    if (!organizationId) return

    try {
      await navigator.clipboard.writeText(
        organizationId
      )
    } catch {
      // Clipboard may be unavailable.
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-12">

      <PageHeader
        eyebrow="Organization owner"
        title="Your organization"
        description="Everything related to the tenant you own, from subscription status to recent billing activity."
      />

      {/* IDENTITY */}

      <Card>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">

            <div className="st-accent-chip flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">

              <Building2
                size={19}
              />

            </div>

            <div>

              <p className="eyebrow">
                Signed in as
              </p>

              <p className="mt-2 font-semibold">
                {email}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--st-text-muted)]">

                <span className="st-tabular font-mono">
                  {organizationId}
                </span>

                <span className="text-[var(--st-text-faint)]">
                  ·
                </span>

                <span>
                  {role}
                </span>

              </div>

            </div>

          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={copyOrgId}
          >
            <Copy size={14} />
            Copy tenant ID
          </Button>

        </div>

      </Card>

      {/* OVERVIEW */}

      <section>

        <p className="eyebrow mb-5">
          Account overview
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          <Card className="flex min-h-[220px] flex-col">

            <div className="flex items-center justify-between">

              <p className="eyebrow">
                Plan
              </p>

              <Badge
                className={
                  subscriptionStatusStyles[
                    subscription?.status ?? ""
                  ]
                }
              >
                {subscription?.status}
              </Badge>

            </div>

            <div className="mt-7">

              <p className="display text-[26px] tracking-[-0.03em]">
                {subscription?.plan.name}
              </p>

              <p className="st-tabular mt-2 text-sm text-[var(--st-text-muted)]">
                $
                {(
                  (subscription?.plan
                    .priceCents ?? 0) /
                  100
                ).toFixed(2)}
                {" "}
                / month
              </p>

            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-auto w-fit"
              onClick={() =>
                navigate("/pricing")
              }
            >
              Change plan
              <ArrowRight size={14} />
            </Button>

          </Card>

          <Card className="flex min-h-[220px] flex-col">

            <div className="flex items-center justify-between">

              <p className="eyebrow">
                Usage
              </p>

              <div className="st-accent-chip h-8 w-8 rounded-lg">
                <Gauge
                  size={15}
                />
              </div>

            </div>

            <div className="mt-7">

              <p className="st-tabular text-[26px] font-semibold tracking-[-0.035em]">
                {summary?.currentPeriodUsage.toLocaleString()}
                <span className="ml-1.5 text-sm font-normal text-[var(--st-text-muted)]">
                  /
                  {summary?.maxUsage.toLocaleString()}
                </span>
              </p>

              <p className="st-tabular mt-2 text-xs text-[var(--st-text-faint)]">
                {percentUsed}% of plan limit
              </p>

            </div>

            <div className="mt-auto">

              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--st-surface-hover)]">

                <div
                  className="h-full rounded-full bg-[var(--accent-gradient)] shadow-[0_0_10px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
                  style={{
                    width: `${percentUsed}%`,
                  }}
                />

              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() =>
                  navigate("/usage")
                }
              >
                Open usage
                <ArrowRight size={14} />
              </Button>

            </div>

          </Card>

          <Card className="flex min-h-[220px] flex-col">

            <div className="flex items-center justify-between">

              <p className="eyebrow">
                Billing period
              </p>

              <div className="st-accent-chip h-8 w-8 rounded-lg">
                <Calendar
                  size={15}
                />
              </div>

            </div>

            <p className="st-tabular mt-7 text-sm font-medium">
              {subscription &&
                `${new Date(
                  subscription.currentPeriodStart
                ).toLocaleDateString()} – ${new Date(
                  subscription.currentPeriodEnd
                ).toLocaleDateString()}`}
            </p>

            <p className="mt-2 text-sm text-[var(--st-text-muted)]">
              {invoices?.length ?? 0} invoice
              {(invoices?.length ?? 0) === 1
                ? ""
                : "s"}{" "}
              on file
            </p>

            <Button
              variant="outline"
              size="sm"
              className="mt-auto w-fit"
              onClick={() =>
                navigate("/billing")
              }
            >
              Open billing
              <ArrowRight size={14} />
            </Button>

          </Card>

        </div>

      </section>

      {/* INVOICES */}

      <Card className="overflow-hidden p-0">

        <div className="flex items-center justify-between border-b border-[var(--st-border)] px-6 py-5">

          <div>
            <p className="eyebrow">
              Billing activity
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
              Recent invoices
            </h2>
          </div>

          <button
            onClick={() =>
              navigate("/billing")
            }
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--st-action)] hover:underline"
          >
            View all
            <ArrowRight size={14} />
          </button>

        </div>

        {recentInvoices.length === 0 ? (
          <div className="px-6 py-12 text-center">

            <p className="text-sm font-medium">
              No invoices yet
            </p>

            <p className="mt-1 text-sm text-[var(--st-text-muted)]">
              Your billing activity will appear here.
            </p>

          </div>
        ) : (
          <div>

            {recentInvoices.map(
              (invoice, index) => (
                <div
                  key={invoice.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-6 px-6 py-4 transition-colors hover:bg-[var(--st-surface-hover)] sm:grid-cols-[1fr_auto_auto]"
                >

                  <div className="flex items-start gap-3">

                    <span
                      className={`st-status-dot mt-1.5 ${
                        invoice.status === "PAID"
                          ? "text-[var(--success)]"
                          : invoice.status === "PENDING"
                            ? "text-[var(--warning)]"
                            : "text-[var(--danger)]"
                      }`}
                    />

                    <div>

                      <p className="st-tabular text-sm font-medium">
                        {new Date(
                          invoice.periodStart
                        ).toLocaleDateString()}{" "}
                        –{" "}
                        {new Date(
                          invoice.periodEnd
                        ).toLocaleDateString()}
                      </p>

                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--st-text-faint)]">
                        Invoice #{index + 1}
                      </p>

                    </div>

                  </div>

                  <Badge
                    className={
                      paymentStatusStyles[
                        invoice.status
                      ]
                    }
                  >
                    {invoice.status}
                  </Badge>

                  <p className="st-tabular hidden text-right text-sm font-semibold sm:block">
                    $
                    {(
                      invoice.totalCents /
                      100
                    ).toFixed(2)}
                  </p>

                </div>
              )
            )}

          </div>
        )}

      </Card>

    </div>
  )
}
