import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ArrowRight, BarChart3, Building2, CreditCard, Receipt, Shield } from "lucide-react"
import { getCurrentSubscription, getUsageSummary } from "@/lib/api"
import { useAppStore } from "@/store/appStore"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { subscriptionStatusStyles } from "@/lib/statusStyles"

export default function DashboardHome() {
  const navigate = useNavigate()
  const email = useAppStore((s) => s.email)
  const role = useAppStore((s) => s.role)

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: getCurrentSubscription,
  })

  const { data: summary } = useQuery({
    queryKey: ["usage-summary"],
    queryFn: getUsageSummary,
  })

  if (isLoading) {
    return <p className="text-[#8b8b9c]">Loading...</p>
  }

  const percentUsed = summary
    ? Math.min(100, Math.round((summary.currentPeriodUsage / summary.maxUsage) * 100))
    : 0

  const quickLinks = [
    { label: "Change plan", description: "Compare tiers and switch immediately", icon: CreditCard, path: "/pricing" },
    { label: "View usage", description: "Track calls against your plan limit", icon: BarChart3, path: "/usage" },
    { label: "View billing", description: "Invoices, payments, and dunning", icon: Receipt, path: "/billing" },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title={`Welcome back${email ? `, ${email.split("@")[0]}` : ""}`}
        description="Your tenant dashboard — plan, usage, and billing for this organization only."
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glow-border overflow-hidden">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7c5cff]/15 text-[#a78bfa]">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-sm text-[#8b8b9c]">Current plan</p>
                <h2 className="mt-1 text-2xl font-semibold">{subscription?.plan.name}</h2>
                <p className="mt-1 text-sm text-[#8b8b9c]">
                  ${((subscription?.plan.priceCents ?? 0) / 100).toFixed(0)}/mo ·{" "}
                  {subscription?.plan.maxUsage.toLocaleString()} calls included
                </p>
              </div>
            </div>
            <Badge className={subscriptionStatusStyles[subscription?.status ?? ""]}>
              {subscription?.status}
            </Badge>
          </div>

          {summary && (
            <div className="mt-6 border-t border-[#262633] pt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[#8b8b9c]">Period usage</span>
                <span>
                  {summary.currentPeriodUsage.toLocaleString()} / {summary.maxUsage.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7c5cff] to-[#22d3ee]"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {quickLinks.map((link, i) => (
          <motion.div
            key={link.path}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * (i + 1) }}
          >
            <Card
              onClick={() => navigate(link.path)}
              className="h-full cursor-pointer space-y-3 hover:border-[#7c5cff]/45"
            >
              <link.icon size={20} className="text-[#7c5cff]" />
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{link.label}</h3>
                <ArrowRight size={14} className="text-[#8b8b9c]" />
              </div>
              <p className="text-sm text-[#8b8b9c]">{link.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {(role === "OWNER" || role === "ADMIN") && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card
            onClick={() => navigate("/organization")}
            className="cursor-pointer hover:border-[#22d3ee]/40"
          >
            <div className="flex items-center gap-3">
              <Building2 size={18} className="text-[#22d3ee]" />
              <div>
                <p className="font-medium">Organization owner console</p>
                <p className="text-sm text-[#8b8b9c]">Your tenant identity, plan, and recent invoices</p>
              </div>
            </div>
          </Card>
          <Card
            onClick={() => navigate("/admin")}
            className="cursor-pointer hover:border-[#7c5cff]/45"
          >
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-[#a78bfa]" />
              <div>
                <p className="font-medium">Platform admin console</p>
                <p className="text-sm text-[#8b8b9c]">Cross-tenant MRR, churn, and tenant directory</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
