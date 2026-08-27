import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { getCurrentSubscription } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardHome() {
  const navigate = useNavigate()

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: getCurrentSubscription,
  })

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-[#8b8b9c]">Loading...</div>
  }

  return (
    <div className="min-h-screen p-12">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <Card className="glow-border max-w-md space-y-3">
        <p className="text-sm text-[#8b8b9c]">Current plan</p>
        <h2 className="text-xl font-semibold">{subscription?.plan.name}</h2>
        <p className="text-sm text-[#8b8b9c]">
          Status: <span className="text-white">{subscription?.status}</span>
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/pricing")}>Change Plan</Button>
          <Button variant="outline" onClick={() => navigate("/usage")}>View Usage</Button>
        </div>
      </Card>
    </div>
  )
}