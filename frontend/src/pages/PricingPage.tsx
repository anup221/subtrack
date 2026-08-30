import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Check } from "lucide-react"
import { getPlans, getCurrentSubscription, changePlan } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { cn } from "@/lib/utils"

export default function PricingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
  })

  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: getCurrentSubscription,
  })

  const mutation = useMutation({
    mutationFn: changePlan,
    onSuccess: async (result) => {
      // Force a fresh re-fetch (not just invalidate) so the new plan/price shows immediately
      await queryClient.refetchQueries({ queryKey: ["subscription"] })
      await queryClient.refetchQueries({ queryKey: ["plans"] })

      if (result.upgradeInvoice) {
        navigate("/billing")
      } else {
        navigate("/dashboard")
      }
    },
  })

  if (plansLoading) {
    return <p className="text-[#8b8b9c]">Loading plans...</p>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Plans"
        title="Choose your plan"
        description="Upgrades bill the prorated difference immediately. Downgrades apply now, billed next cycle."
      />

      {mutation.data?.upgradeInvoice && (
        <Card className="glow-border">
          <p className="text-sm">
            Your plan changed — an invoice for{" "}
            <strong>${(mutation.data.upgradeInvoice.totalCents / 100).toFixed(2)}</strong> is waiting on the
            Billing page.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans?.map((plan) => {
          const isCurrent = subscription?.plan.id === plan.id
          const isPopular = plan.name === "Pro"
          return (
            <Card
              key={plan.id}
              className={cn("relative space-y-5", isCurrent && "glow-border", isPopular && !isCurrent && "border-[#7c5cff]/25")}
            >
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7c5cff] text-white">
                  Most popular
                </Badge>
              )}
              <div>
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <p className="mt-3 text-3xl font-bold tracking-tight">
                  ${(plan.priceCents / 100).toFixed(0)}
                  <span className="text-sm font-normal text-[#8b8b9c]">/mo</span>
                </p>
              </div>
              <ul className="space-y-2.5 text-sm text-[#8b8b9c]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-[#7c5cff]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={isCurrent ? "secondary" : "default"}
                disabled={isCurrent || mutation.isPending}
                onClick={() => mutation.mutate(plan.id)}
              >
                {isCurrent ? "Current plan" : mutation.isPending ? "Switching..." : "Choose plan"}
              </Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}