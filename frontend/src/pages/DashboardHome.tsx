import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  Building2,
  CreditCard,
  Receipt,
  Shield,
} from "lucide-react"

import {
  getCurrentSubscription,
  getUsageSummary,
} from "@/lib/api"

import { useAppStore } from "@/store/appStore"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"

import {
  subscriptionStatusStyles,
} from "@/lib/statusStyles"

export default function DashboardHome() {
  const navigate = useNavigate()

  const email = useAppStore((s) => s.email)
  const role = useAppStore((s) => s.role)

  const {
    data: subscription,
    isLoading,
    isError: subscriptionError,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: getCurrentSubscription,
    retry: false,
  })

  const { data: summary } = useQuery({
    queryKey: ["usage-summary"],
    queryFn: getUsageSummary,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded bg-[var(--st-surface-hover)]" />
        <div className="h-12 w-80 animate-pulse rounded bg-[var(--st-surface-hover)]" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-[var(--st-surface-hover)]" />
      </div>
    )
  }

  if (subscriptionError || !subscription) {
    return (
      <div className="mx-auto max-w-6xl pb-12">
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col items-start gap-3 p-8 sm:flex-row sm:items-center">
            <div className="st-chip-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <Shield size={19} className="text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-base font-medium text-[var(--st-text)]">
                No active subscription found
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--st-text-muted)]">
                Your workspace doesn't have a subscription yet. Choose a
                plan to get started.
              </p>
            </div>
            <Button
              className="sm:ml-auto"
              onClick={() => navigate("/pricing")}
            >
              Choose a plan
              <ArrowRight size={15} />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const percentUsed = summary
    ? Math.min(
        100,
        Math.round(
          (summary.currentPeriodUsage /
            summary.maxUsage) *
            100
        )
      )
    : 0

  const quickLinks = [
    {
      label: "Change plan",
      description:
        "Compare plans and adjust your subscription.",
      icon: CreditCard,
      path: "/pricing",
    },
    {
      label: "View usage",
      description:
        "Track API calls against your monthly allowance.",
      icon: BarChart3,
      path: "/usage",
    },
    {
      label: "View billing",
      description:
        "Review invoices and payment history.",
      icon: Receipt,
      path: "/billing",
    },
  ]

  const firstName = email
    ? email.split("@")[0]
    : ""

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-12">

      <PageHeader
        eyebrow="Workspace"
        title={`Welcome back${firstName ? `, ${firstName}` : ""}.`}
        description="A clear view of your subscription, usage, and billing."
      />

      {/* CURRENT PLAN */}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="relative overflow-hidden p-0 shadow-[inset_0_1px_0_var(--edge),var(--st-shadow-md)]">
          <div
            className="pointer-events-none absolute inset-y-0 -right-24 w-[360px] bg-[var(--accent-gradient-soft)] blur-2xl"
            aria-hidden
          />

          <div className="relative flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              <div className="st-chip-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <Shield
                  size={20}
                  className="text-[var(--accent)]"
                />
              </div>

              <div>

                <p className="eyebrow">
                  Current plan
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">

                  <h2 className="text-2xl font-semibold tracking-[-0.035em]">
                    {subscription?.plan.name}
                  </h2>

                  <Badge
                    className={
                      subscriptionStatusStyles[
                        subscription?.status ?? ""
                      ]
                    }
                  >
                    {subscription?.status}
                  </Badge>

                </div>

                {subscription?.scheduledPlan && (
                  <p className="mt-2 text-sm text-[var(--st-success)]">
                    → {subscription.scheduledPlan.name}{" "}
                    scheduled for next billing cycle
                  </p>
                )}

                <p className="mt-2 text-sm text-[var(--st-text-muted)]">
                  $
                  {(
                    (subscription?.plan.priceCents ??
                      0) /
                    100
                  ).toFixed(0)}
                  /month
                  <span className="mx-2 text-[var(--st-text-faint)]">
                    ·
                  </span>
                  {subscription?.plan.maxUsage.toLocaleString()}{" "}
                  calls included
                </p>

              </div>

            </div>

            <div className="min-w-[220px]">

              <div className="mb-2 flex items-center justify-between">

                <span className="eyebrow">
                  Usage
                </span>

                <span className="numeric text-xs font-medium">
                  {percentUsed}%
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full border border-[var(--st-border)] bg-[var(--st-surface-hover)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">

                <div
                  className="h-full rounded-full bg-[var(--accent-gradient)] shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_60%,transparent)] transition-all duration-500"
                  style={{
                    width: `${percentUsed}%`,
                  }}
                />

              </div>

              <p className="mt-2 text-xs text-[var(--st-text-faint)]">
                <span className="numeric">{summary?.currentPeriodUsage.toLocaleString()}</span>{" "}
                of{" "}
                <span className="numeric">{summary?.maxUsage.toLocaleString()}</span>{" "}
                calls
              </p>

            </div>

          </div>

        </Card>
      </motion.div>

      {/* QUICK ACTIONS */}

      <section>

        <div className="mb-5 flex items-end justify-between">

          <div>
            <p className="eyebrow">
              Workspace
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
              Quick actions
            </h2>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {quickLinks.map((link, index) => (
            <motion.div
              key={link.path}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
            >

              <Card
                onClick={() =>
                  navigate(link.path)
                }
                className="group flex h-full cursor-pointer flex-col"
              >

                <div className="flex items-start justify-between">

                  <div className="st-chip-icon flex h-10 w-10 items-center justify-center rounded-xl">

                    <link.icon
                      size={17}
                      className="text-[var(--accent)]"
                    />

                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--st-border)] bg-[var(--surface-sunken)] text-[var(--st-text-faint)] transition-colors group-hover:border-[color-mix(in_srgb,var(--accent)_40%,transparent)] group-hover:text-[var(--accent)]">

                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />

                  </div>

                </div>

                <div className="mt-auto pt-12">

                  <h3 className="font-semibold tracking-[-0.015em]">
                    {link.label}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--st-text-muted)]">
                    {link.description}
                  </p>

                </div>

              </Card>

            </motion.div>
          ))}

        </div>

      </section>

      {/* PRIVILEGED ACTIONS */}

      {(role === "OWNER" ||
        role === "ADMIN") && (
        <section>

          <p className="eyebrow mb-5">
            Administration
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <Card
              onClick={() =>
                navigate("/organization")
              }
              className="group cursor-pointer"
            >

              <div className="flex items-start justify-between">

                <div className="st-chip-icon flex h-10 w-10 items-center justify-center rounded-xl">
                  <Building2
                    size={17}
                    className="text-[var(--accent)]"
                  />
                </div>

                <ArrowRight
                  size={15}
                  className="text-[var(--st-text-faint)] transition-transform group-hover:translate-x-1"
                />

              </div>

              <h3 className="mt-8 font-semibold">
                Organization owner console
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--st-text-muted)]">
                Manage your tenant identity, plan,
                usage, and invoices.
              </p>

            </Card>

          </div>

        </section>
      )}

    </div>
  )
}