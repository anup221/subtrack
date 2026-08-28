import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { DollarSign, Building2, Users, TrendingDown } from "lucide-react"
import { getAdminMetrics, getAdminTenants } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const statusStyles: Record<string, string> = {
  TRIAL: "bg-[#fbbf24]/15 text-[#fbbf24]",
  ACTIVE: "bg-[#34d399]/15 text-[#34d399]",
  PAST_DUE: "bg-orange-500/15 text-orange-400",
  CANCELED: "bg-[#f87171]/15 text-[#f87171]",
  NONE: "bg-white/10 text-[#8b8b9c]",
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

export default function AdminOverview() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: getAdminMetrics,
  })

  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: getAdminTenants,
  })

  if (metricsLoading || tenantsLoading) {
    return <p className="text-[#8b8b9c]">Loading admin data...</p>
  }

  const stats = [
    { label: "MRR", value: `$${((metrics?.mrrCents ?? 0) / 100).toFixed(2)}`, icon: DollarSign },
    { label: "Organizations", value: metrics?.totalOrganizations ?? 0, icon: Building2 },
    { label: "Active Subscriptions", value: metrics?.activeSubscriptions ?? 0, icon: Users },
    { label: "Churn Rate", value: `${metrics?.churnRatePercent ?? 0}%`, icon: TrendingDown },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold">Admin Overview</h1>
        <p className="text-[#8b8b9c] text-sm mt-1">Cross-tenant metrics, visible to Owners and Admins only.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="space-y-2">
              <stat.icon size={18} className="text-[#7c5cff]" />
              <p className="text-xs text-[#8b8b9c]">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div>
        <p className="text-sm text-[#8b8b9c] mb-3">Tenants</p>
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8b8b9c] border-b border-[#24242f]">
                <th className="p-3 font-normal">Organization</th>
                <th className="p-3 font-normal">Plan</th>
                <th className="p-3 font-normal">Status</th>
                <th className="p-3 font-normal">Joined</th>
              </tr>
            </thead>
            <tbody>
              {tenants?.map((t) => (
                <tr key={t.organizationId} className="border-b border-[#24242f] last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#7c5cff]/15 text-[#c4b5fd] text-xs flex items-center justify-center font-medium">
                        {initials(t.organizationName)}
                      </div>
                      {t.organizationName}
                    </div>
                  </td>
                  <td className="p-3 text-[#8b8b9c]">{t.planName}</td>
                  <td className="p-3">
                    <Badge className={statusStyles[t.subscriptionStatus] ?? statusStyles.NONE}>
                      {t.subscriptionStatus}
                    </Badge>
                  </td>
                  <td className="p-3 text-[#8b8b9c]">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}