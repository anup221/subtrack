import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { CreditCard, BarChart3, Receipt, ArrowRight } from "lucide-react"
import { getCurrentSubscription } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const statusStyles: Record<string, string> = {
  TRIAL: "bg-[#fbbf24]/15 text-[#fbbf24]",
  ACTIVE: "bg-[#34d399]/15 text-[#34d399]",
  PAST_DUE: "bg-orange-500/15 text-orange-400",
  CANCELED: "bg-[#f87171]/15 text-[#f87171]",
}

export default function DashboardHome() {
  const navigate = useNavigate()

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: getCurrentSubscription,
  })

  if (isLoading) {
    return <p className="text-[#8b8b9c]">Loading...</p>
  }

  const quickLinks = [
    { label: "Change Plan", description: "Compare tiers and upgrade or downgrade", icon: CreditCard, path: "/pricing" },
    { label: "View Usage", description: "See how close you are to your plan limit", icon: BarChart3, path: "/usage" },
    { label: "View Billing", description: "Browse invoices and payment history", icon: Receipt, path: "/billing" },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-[#8b8b9c] text-sm mt-1">Here's what's happening with your account.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glow-border flex items-center justify-between">
          <div>
            <p className="text-sm text-[#8b8b9c]">Current plan</p>
            <h2 className="text-2xl font-semibold mt-1">{subscription?.plan.name}</h2>
          </div>
          <Badge className={statusStyles[subscription?.status ?? ""] ?? "bg-white/10 text-white"}>
            {subscription?.status}
          </Badge>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link, i) => (
          <motion.div
            key={link.path}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * (i + 1) }}
          >
            <Card
              onClick={() => navigate(link.path)}
              className="cursor-pointer hover:border-[#7c5cff]/50 transition-colors space-y-3 h-full"
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
    </div>
  )
}