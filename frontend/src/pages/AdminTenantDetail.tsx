import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  Circle,
  Mail,
  FileText,
  IndianRupee,
} from "lucide-react"

import { api } from "@/lib/api"
import { useAppStore } from "@/store/appStore"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TenantDetailResponse = {
  organizationId: string
  organizationName: string
  organizationStatus: string
  ownerEmail: string
  planName: string
  subscriptionStatus: string
  totalRevenueCents: number
  invoiceCount: number
  createdAt: string
}

export default function AdminTenantDetail() {
  const { organizationId } = useParams<{
    organizationId: string
  }>()

  const navigate = useNavigate()

  const token = useAppStore((state) => state.token)
  const isPlatformAdmin = useAppStore(
    (state) => state.isPlatformAdmin
  )

  const [tenant, setTenant] =
    useState<TenantDetailResponse | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!organizationId) {
      setError("Organization ID is missing")
      setLoading(false)
      return
    }

    async function loadTenant() {
      try {
        setLoading(true)
        setError("")

        const { data } =
          await api.get<TenantDetailResponse>(
            `/api/admin/tenants/${organizationId}`
          )

        setTenant(data)
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data ||
          "Unable to load organization details"

        setError(
          typeof message === "string"
            ? message
            : "Unable to load organization details"
        )
      } finally {
        setLoading(false)
      }
    }

    loadTenant()
  }, [organizationId])

  if (!token) {
    navigate("/admin/login", { replace: true })
    return null
  }

  if (!isPlatformAdmin) {
    navigate("/dashboard", { replace: true })
    return null
  }

  function formatMoney(cents: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(cents / 100)
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date))
  }

  function statusClass(status: string) {
    if (status === "ACTIVE") {
      return "text-[var(--success)]"
    }

    if (
      status === "BLOCKED" ||
      status === "DELETED" ||
      status === "CANCELED"
    ) {
      return "text-[var(--danger)]"
    }

    return "text-[var(--st-text-muted)]"
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl">

        {/* Header */}
        <div className="mb-8">

          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-5 -ml-2 gap-2"
          >
            <ArrowLeft size={16} />
            Back to organizations
          </Button>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

            <div>
              <p className="eyebrow mb-2">
                Platform administration
              </p>

              <h1 className="text-3xl font-semibold tracking-[-0.04em]">
                {loading
                  ? "Organization details"
                  : tenant?.organizationName ?? "Organization"}
              </h1>

              <p className="mt-2 text-sm text-[var(--st-text-muted)]">
                Detailed organization, subscription and billing information.
              </p>
            </div>

            {tenant && (
              <div
                className={cn(
                  "inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em]",
                  "border-[var(--st-border)] bg-[var(--st-surface)]",
                  statusClass(tenant.organizationStatus)
                )}
              >
                <Circle
                  size={7}
                  fill="currentColor"
                />

                {tenant.organizationStatus}
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-[var(--st-border)] bg-[var(--st-surface)] p-8 text-sm text-[var(--st-text-muted)]">
            Loading organization details...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[var(--danger-soft)] p-5 text-sm text-[var(--danger)]">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && tenant && (
          <div className="space-y-6">

            {/* Organization information */}
            <section className="rounded-xl border border-[var(--st-border)] bg-[var(--st-surface)]">

              <div className="border-b border-[var(--st-border)] px-5 py-4">
                <div className="flex items-center gap-3">
                  <Building2
                    size={18}
                    className="text-[var(--st-accent)]"
                  />

                  <div>
                    <h2 className="text-sm font-semibold">
                      Organization
                    </h2>

                    <p className="mt-0.5 text-xs text-[var(--st-text-muted)]">
                      Organization identity and ownership.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2">

                <div>
                  <p className="eyebrow mb-1">
                    Organization name
                  </p>

                  <p className="text-sm font-medium">
                    {tenant.organizationName}
                  </p>
                </div>

                <div>
                  <p className="eyebrow mb-1">
                    Organization ID
                  </p>

                  <p className="break-all font-mono text-xs text-[var(--st-text-muted)]">
                    {tenant.organizationId}
                  </p>
                </div>

                <div>
                  <p className="eyebrow mb-1">
                    Owner email
                  </p>

                  <div className="flex items-center gap-2 text-sm">
                    <Mail
                      size={14}
                      className="text-[var(--st-text-faint)]"
                    />

                    {tenant.ownerEmail}
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-1">
                    Created
                  </p>

                  <p className="text-sm">
                    {formatDate(tenant.createdAt)}
                  </p>
                </div>

              </div>
            </section>

            {/* Subscription */}
            <section className="rounded-xl border border-[var(--st-border)] bg-[var(--st-surface)]">

              <div className="border-b border-[var(--st-border)] px-5 py-4">
                <h2 className="text-sm font-semibold">
                  Subscription
                </h2>

                <p className="mt-0.5 text-xs text-[var(--st-text-muted)]">
                  Current plan and subscription status.
                </p>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2">

                <div>
                  <p className="eyebrow mb-1">
                    Current plan
                  </p>

                  <p className="text-sm font-medium">
                    {tenant.planName}
                  </p>
                </div>

                <div>
                  <p className="eyebrow mb-1">
                    Subscription status
                  </p>

                  <p
                    className={cn(
                      "text-sm font-medium",
                      statusClass(
                        tenant.subscriptionStatus
                      )
                    )}
                  >
                    {tenant.subscriptionStatus}
                  </p>
                </div>

              </div>
            </section>

            {/* Billing metrics */}
            <section className="grid gap-4 md:grid-cols-2">

              <div className="rounded-xl border border-[var(--st-border)] bg-[var(--st-surface)] p-5">

                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--st-border)]">
                  <IndianRupee
                    size={17}
                    className="text-[var(--st-accent)]"
                  />
                </div>

                <p className="eyebrow mb-1">
                  Total revenue collected
                </p>

                <p className="text-2xl font-semibold tracking-[-0.03em]">
                  {formatMoney(
                    tenant.totalRevenueCents
                  )}
                </p>

              </div>

              <div className="rounded-xl border border-[var(--st-border)] bg-[var(--st-surface)] p-5">

                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--st-border)]">
                  <FileText
                    size={17}
                    className="text-[var(--st-accent)]"
                  />
                </div>

                <p className="eyebrow mb-1">
                  Invoices
                </p>

                <p className="text-2xl font-semibold tracking-[-0.03em]">
                  {tenant.invoiceCount}
                </p>

              </div>

            </section>

          </div>
        )}
      </div>
    </DashboardLayout>
  )
}