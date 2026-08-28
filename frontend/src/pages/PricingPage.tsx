import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Check } from "lucide-react"
import { getPlans, getCurrentSubscription, changePlan } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] })
      navigate("/dashboard")
    },
  })

  if (plansLoading) {
    return <p className="text-[#8b8b9c]">Loading plans...</p>
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold">Choose your plan</h1>
        <p className="text-[#8b8b9c] text-sm mt-1">Upgrade or downgrade anytime — changes apply immediately.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans?.map((plan) => {
          const isCurrent = subscription?.plan.id === plan.id
          const isPopular = plan.name === "Pro"
          return (
            <Card key={plan.id} className={cn("space-y-4 relative", isCurrent && "glow-border")}>
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7c5cff] text-white">
                  Most Popular
                </Badge>
              )}
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="text-3xl font-bold">
                ${(plan.priceCents / 100).toFixed(0)}
                <span className="text-sm text-[#8b8b9c] font-normal">/mo</span>
              </p>
              <ul className="text-sm text-[#8b8b9c] space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={16} className="text-[#7c5cff] mt-0.5 shrink-0" />
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
                {isCurrent ? "Current Plan" : mutation.isPending ? "Switching..." : "Choose Plan"}
              </Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}