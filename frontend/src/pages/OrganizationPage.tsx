import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Building2, Calendar, Copy, CreditCard, Gauge, Shield } from "lucide-react"
import { getCurrentSubscription, getInvoices, getUsageSummary } from "@/lib/api"
import { useAppStore } from "@/store/appStore"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { paymentStatusStyles, subscriptionStatusStyles } from "@/lib/statusStyles"

export default function OrganizationPage() {
  const navigate = useNavigate()
  const email = useAppStore((s) => s.email)
  const role = useAppStore((s) => s.role)
  const organizationId = useAppStore((s) => s.organizationId)

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: getCurrentSubscription,
  })

  const { data: summary, isLoading: usageLoading } = useQuery({
    queryKey: ["usage-summary"],
    queryFn: getUsageSummary,
  })

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  })

  if (subLoading || usageLoading || invoicesLoading) {
    return <p className="text-[#8b8b9c]">Loading organization...</p>
  }

  const percentUsed = summary
    ? Math.min(100, Math.round((summary.currentPeriodUsage / summary.maxUsage) * 100))
    : 0

  const recentInvoices = invoices?.slice(0, 3) ?? []

  async function copyOrgId() {
    if (!organizationId) return
    try {
      await navigator.clipboard.writeText(organizationId)
    } catch {
      /* clipboard may be unavailable in some browsers */
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Organization owner"
        title="Your organization"
        description="Tenant-scoped view of plan, usage, and billing for the organization you own — not the platform-wide admin console."
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="cyan-glow relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#22d3ee]/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22d3ee]/15 text-[#22d3ee]">
                <Building2 size={22} />
              </div>
              <div>
                <p className="text-sm text-[#8b8b9c]">Signed in as</p>
                <p className="mt-0.5 text-lg font-semibold">{email}</p>
                <p className="mt-1 font-mono text-xs text-[#8b8b9c]">
                  Tenant {organizationId}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#22d3ee]/15 text-[#22d3ee] ring-1 ring-[#22d3ee]/20">
                {role}
              </Badge>
              <Button variant="outline" size="sm" onClick={copyOrgId}>
                <Copy size={14} className="mr-1.5" />
                Copy tenant ID
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-[#8b8b9c]">
            <Shield size={16} className="text-[#7c5cff]" />
            <span className="text-xs uppercase tracking-wide">Plan</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xl font-semibold">{subscription?.plan.name}</p>
            <Badge className={subscriptionStatusStyles[subscription?.status ?? ""]}>
              {subscription?.status}
            </Badge>
          </div>
          <p className="text-sm text-[#8b8b9c]">
            ${((subscription?.plan.priceCents ?? 0) / 100).toFixed(2)} / month
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate("/pricing")}>
            Change plan
          </Button>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-[#8b8b9c]">
            <Gauge size={16} className="text-[#22d3ee]" />
            <span className="text-xs uppercase tracking-wide">Usage this period</span>
          </div>
          <p className="text-xl font-semibold">
            {summary?.currentPeriodUsage.toLocaleString()}{" "}
            <span className="text-sm font-normal text-[#8b8b9c]">
              / {summary?.maxUsage.toLocaleString()}
            </span>
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7c5cff] to-[#22d3ee]"
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <p className="text-xs text-[#8b8b9c]">{percentUsed}% of plan limit</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/usage")}>
            Open usage
          </Button>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-[#8b8b9c]">
            <Calendar size={16} className="text-[#a78bfa]" />
            <span className="text-xs uppercase tracking-wide">Current period</span>
          </div>
          <p className="text-sm leading-relaxed">
            {subscription &&
              `${new Date(subscription.currentPeriodStart).toLocaleDateString()} – ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
          </p>
          <p className="text-xs text-[#8b8b9c]">
            {invoices?.length ?? 0} invoice{(invoices?.length ?? 0) === 1 ? "" : "s"} on file
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate("/billing")}>
            Open billing
          </Button>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-[#7c5cff]" />
            <h2 className="font-medium">Recent invoices</h2>
          </div>
          <button
            onClick={() => navigate("/billing")}
            className="text-sm text-[#a78bfa] hover:text-white"
          >
            View all
          </button>
        </div>

        {recentInvoices.length === 0 && (
          <p className="text-sm text-[#8b8b9c]">No invoices yet for this organization.</p>
        )}

        <div className="space-y-2">
          {recentInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between rounded-lg border border-[#262633] bg-black/20 px-4 py-3"
            >
              <div>
                <p className="text-sm">
                  {new Date(invoice.periodStart).toLocaleDateString()} –{" "}
                  {new Date(invoice.periodEnd).toLocaleDateString()}
                </p>
                <p className="text-xs text-[#8b8b9c]">
                  ${(invoice.totalCents / 100).toFixed(2)}
                </p>
              </div>
              <Badge className={paymentStatusStyles[invoice.status]}>{invoice.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
