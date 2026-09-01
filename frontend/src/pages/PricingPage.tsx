import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react"

import {
  cancelPlanChange,
  changePlan,
  getCurrentSubscription,
  getPlans,
} from "@/lib/api"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { cn } from "@/lib/utils"

export default function PricingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: plans,
    isLoading: plansLoading,
  } = useQuery({
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
      await queryClient.refetchQueries({
        queryKey: ["subscription"],
      })

      if (result.upgradeInvoice) {
        navigate(`/billing?invoice=${result.upgradeInvoice.id}`)
      } else {
        navigate("/dashboard")
      }
    },
  })

  const cancelMutation = useMutation({
    mutationFn: cancelPlanChange,
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ["subscription"],
      })
    },
  })

  if (plansLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="space-y-3">
          <div className="h-3 w-20 animate-pulse rounded bg-[var(--st-surface-hover)]" />
          <div className="h-10 w-72 animate-pulse rounded bg-[var(--st-surface-hover)]" />
          <div className="h-4 w-[420px] max-w-full animate-pulse rounded bg-[var(--st-surface-hover)]" />
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[480px] animate-pulse rounded-2xl border border-[var(--st-border)] bg-[var(--st-surface)]"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl pb-12">

      {/* HEADER */}

      <PageHeader
        eyebrow="Plans"
        title="Choose what fits your product."
        description="Simple plans for teams starting small, scaling quickly, or operating at enterprise volume."
      />

      {/* PENDING UPGRADE */}

      {subscription?.pendingPlan &&
        !mutation.data?.upgradeInvoice && (
          <div className="mt-8 rounded-xl border border-[var(--st-danger-border)] bg-[var(--st-danger-bg)] px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--st-text)]">
                  Upgrade to {subscription.pendingPlan.name} is
                  awaiting payment
                </p>
                <p className="mt-1 text-sm text-[var(--st-text-muted)]">
                  Complete the Razorpay checkout to activate it, or
                  cancel the pending change to pick a different plan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate()}
                >
                  {cancelMutation.isPending
                    ? "Cancelling..."
                    : "Cancel change"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/billing")}
                >
                  Pay now
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}

      {/* UPGRADE MESSAGE */}

      {mutation.data?.upgradeInvoice && (
        <div className="mt-8 rounded-xl border border-[var(--st-danger-border)] bg-[var(--st-danger-bg)] px-5 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-medium text-[var(--st-text)]">
                Your upgrade is ready for payment.
              </p>

              <p className="mt-1 text-sm text-[var(--st-text-muted)]">
                An invoice for{" "}
                <span className="font-semibold text-[var(--st-text)]">
                  $
                  {(
                    mutation.data.upgradeInvoice.totalCents / 100
                  ).toFixed(2)}
                </span>{" "}
                will be charged after checkout; your current plan remains active until then.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/billing")}
            >
              View invoice
              <ArrowRight size={14} />
            </Button>

          </div>
        </div>
      )}

      {/* PLAN INTRO */}

      <div className="mt-12 mb-6 flex items-end justify-between gap-6">

        <div>
          <p className="eyebrow">
            Subscription
          </p>

          <p className="mt-2 text-sm text-[var(--st-text-muted)]">
            Switch plans whenever your usage changes.
          </p>
        </div>

        {subscription?.plan && (
          <div className="hidden text-right sm:block">
            <p className="eyebrow">
              Current plan
            </p>

            <p className="mt-2 text-sm font-medium text-[var(--st-text)]">
              {subscription.plan.name}
            </p>

            {subscription.scheduledPlan && (
              <p className="mt-1 text-xs text-[var(--st-success)]">
                → {subscription.scheduledPlan.name} next cycle
              </p>
            )}
          </div>
        )}

      </div>

      {/* PLANS */}

      <div className="grid items-stretch gap-5 md:grid-cols-3">

        {plans?.map((plan) => {

          const isCurrent =
            subscription?.plan.id === plan.id

          const isScheduled =
            subscription?.scheduledPlan?.id === plan.id &&
            !isCurrent

          const isPopular =
            plan.name.toLowerCase() === "pro"

          return (
            <Card
              key={plan.id}
              className={cn(
                "group relative flex min-h-[480px] flex-col overflow-hidden rounded-2xl",
                "border-[var(--st-border)]",
                "bg-[var(--st-surface)]",
                "transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-[var(--st-border-strong)]",
                isCurrent &&
                  "border-[color-mix(in_srgb,var(--accent)_45%,transparent)] shadow-[inset_0_1px_0_var(--edge),var(--st-ring-glow)]",
                isScheduled &&
                  "border-dashed border-[var(--st-border-strong)] opacity-90",
                isPopular &&
                  !isCurrent &&
                  !isScheduled &&
                  "border-[var(--st-border-strong)] shadow-[inset_0_1px_0_var(--edge),var(--st-shadow-md)]"
              )}
            >

              {/* AMBIENT GLOW */}
              <div
                className={cn(
                  "pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full blur-3xl transition-opacity",
                  isCurrent
                    ? "bg-[var(--accent-gradient-soft)] opacity-100"
                    : isPopular
                      ? "bg-[var(--accent-gradient-soft)] opacity-0 group-hover:opacity-100"
                      : "bg-[var(--accent-gradient-soft)] opacity-0 group-hover:opacity-70"
                )}
                aria-hidden
              />

              {/* TOP ACCENT */}

              <div
                className={cn(
                  "absolute inset-x-0 top-0 h-[3px]",
                  isCurrent
                    ? "bg-[var(--accent-gradient)]"
                    : isPopular
                      ? "bg-[var(--accent-gradient)] opacity-70"
                      : "bg-transparent"
                )}
              />

              {/* CARD HEADER */}

              <div className="border-b border-[var(--st-border)] p-7">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p
                      className={cn(
                        "eyebrow",
                        isCurrent &&
                          "text-[var(--st-action)]",
                        isScheduled &&
                          "text-[var(--st-success)]"
                      )}
                    >
                      {isScheduled
                        ? "Scheduled"
                        : isPopular
                          ? "Recommended"
                          : isCurrent
                            ? "Your plan"
                            : "Plan"}
                    </p>

                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-[var(--st-text)]">
                      {plan.name}
                    </h2>

                  </div>

                  {isCurrent && (
                    <span className="rounded-full border border-[var(--st-action)]/30 bg-[var(--st-action)]/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--st-action)]">
                      Current
                    </span>
                  )}

                  {isScheduled && (
                    <span className="rounded-full border border-[var(--st-success)]/30 bg-[var(--st-success)]/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--st-success)]">
                      Next cycle
                    </span>
                  )}

                  {!isCurrent && !isScheduled && isPopular && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--st-border)] bg-[var(--st-surface-raised)]">
                      <Sparkles
                        size={14}
                        className="text-[var(--st-action)]"
                      />
                    </div>
                  )}

                </div>

                {/* PRICE */}

                <div className="mt-8 flex items-baseline gap-2">

                  <span className="text-4xl font-semibold tracking-[-0.045em] text-[var(--st-text)]">
                    $
                    {(plan.priceCents / 100).toFixed(0)}
                  </span>

                  <span className="text-sm text-[var(--st-text-muted)]">
                    / month
                  </span>

                </div>

                <p className="mt-2 text-xs text-[var(--st-text-faint)]">
                  Billed according to your subscription cycle.
                </p>

              </div>

              {/* FEATURES */}

              <div className="flex flex-1 flex-col p-7">

                <p className="eyebrow mb-5">
                  Includes
                </p>

                <ul className="space-y-4">

                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-5 text-[var(--st-text-muted)]"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--st-surface-hover)]">
                        <Check
                          size={12}
                          strokeWidth={2.5}
                          className="text-[var(--st-success)]"
                        />
                      </span>

                      <span>
                        {feature}
                      </span>
                    </li>
                  ))}

                </ul>

                {/* BUTTON */}

                <div className="mt-auto pt-8">

                  <Button
                    className="w-full"
                    variant={
                      isCurrent
                        ? "secondary"
                        : isScheduled
                          ? "outline"
                          : isPopular
                            ? "default"
                            : "outline"
                    }
                    disabled={
                      isCurrent ||
                      isScheduled ||
                      mutation.isPending
                    }
                    onClick={() =>
                      mutation.mutate(plan.id)
                    }
                  >
                    {isCurrent
                      ? "Current plan"
                      : isScheduled
                        ? "Scheduled"
                        : mutation.isPending
                          ? "Switching..."
                          : "Choose plan"}

                    {!isCurrent &&
                      !isScheduled &&
                      !mutation.isPending && (
                        <ArrowRight size={15} />
                      )}
                  </Button>

                </div>

              </div>

            </Card>
          )
        })}

      </div>

      {/* FOOTNOTE */}

      <div className="mt-7 flex flex-col gap-2 border-t border-[var(--st-border)] pt-5 text-xs text-[var(--st-text-faint)] sm:flex-row sm:items-center sm:justify-between">

        <span>
          Upgrade charges are prorated.
        </span>

        <span>
          Downgrades take effect for the next billing cycle.
        </span>

      </div>

    </div>
  )
}
