import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { getPlans, getCurrentSubscription, changePlan } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
    return <div className="min-h-screen flex items-center justify-center text-[#8b8b9c]">Loading plans...</div>
  }

  return (
    <div className="min-h-screen p-12">
      <h1 className="text-3xl font-semibold text-center mb-10">Choose your plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans?.map((plan) => {
          const isCurrent = subscription?.plan.id === plan.id
          return (
            <Card key={plan.id} className={isCurrent ? "glow-border space-y-4" : "space-y-4"}>
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="text-2xl font-bold">
                ${(plan.priceCents / 100).toFixed(0)}
                <span className="text-sm text-[#8b8b9c] font-normal">/mo</span>
              </p>
              <ul className="text-sm text-[#8b8b9c] space-y-1">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <Button
                className="w-full"
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