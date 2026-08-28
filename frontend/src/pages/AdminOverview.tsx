import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Building2, DollarSign, Search, TrendingDown, Users } from "lucide-react"
import { getAdminMetrics, getAdminTenants } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { subscriptionStatusStyles } from "@/lib/statusStyles"

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function AdminOverview() {
  const [query, setQuery] = useState("")

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: getAdminMetrics,
  })

  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: getAdminTenants,
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tenants ?? []
    return (tenants ?? []).filter(
      (t) =>
        t.organizationName.toLowerCase().includes(q) ||
        t.planName.toLowerCase().includes(q) ||
        t.subscriptionStatus.toLowerCase().includes(q)
    )
  }, [tenants, query])

  if (metricsLoading || tenantsLoading) {
    return <p className="text-[#8b8b9c]">Loading admin data...</p>
  }

  const stats = [
    { label: "MRR", value: `$${((metrics?.mrrCents ?? 0) / 100).toFixed(2)}`, icon: DollarSign },
    { label: "Organizations", value: metrics?.totalOrganizations ?? 0, icon: Building2 },
    { label: "Active subscriptions", value: metrics?.activeSubscriptions ?? 0, icon: Users },
    { label: "Churn rate", value: `${metrics?.churnRatePercent ?? 0}%`, icon: TrendingDown },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Platform admin"
        title="Admin console"
        description="Cross-tenant metrics across every organization on the platform — separate from the owner console for a single tenant."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#8b8b9c]">All tenants</p>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c5c6b]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter tenants..."
              className="pl-8"
            />
          </div>
        </div>
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262633] text-left text-[#8b8b9c]">
                <th className="p-3 font-normal">Organization</th>
                <th className="p-3 font-normal">Plan</th>
                <th className="p-3 font-normal">Status</th>
                <th className="p-3 font-normal">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.organizationId} className="border-b border-[#262633] last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7c5cff]/15 text-xs font-medium text-[#c4b5fd]">
                        {initials(t.organizationName)}
                      </div>
                      {t.organizationName}
                    </div>
                  </td>
                  <td className="p-3 text-[#8b8b9c]">{t.planName}</td>
                  <td className="p-3">
                    <Badge className={subscriptionStatusStyles[t.subscriptionStatus] ?? subscriptionStatusStyles.NONE}>
                      {t.subscriptionStatus}
                    </Badge>
                  </td>
                  <td className="p-3 text-[#8b8b9c]">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="p-6 text-center text-sm text-[#8b8b9c]">No tenants match that filter.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
