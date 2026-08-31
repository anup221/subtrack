import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  AreaChart,
} from "@tremor/react"
import {
  Activity,
  ArrowUpRight,
} from "lucide-react"

import {
  getUsageSummary,
  recordUsage,
} from "@/lib/api"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"

export default function UsagePage() {
  const queryClient = useQueryClient()

  const {
    data: summary,
    isLoading,
  } = useQuery({
    queryKey: ["usage-summary"],
    queryFn: getUsageSummary,
  })

  const mutation = useMutation({
    mutationFn: (quantity: number) =>
      recordUsage(quantity),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["usage-summary"],
      })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded bg-[var(--st-surface-hover)]" />
        <div className="h-12 w-48 animate-pulse rounded bg-[var(--st-surface-hover)]" />
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

  const chartData =
    summary?.dailyBreakdown.map(
      (point) => ({
        date: point.date,
        "API Calls": point.usage,
      })
    ) ?? []

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-12">

      <PageHeader
        eyebrow="Metering"
        title="Usage"
        description="Monitor API consumption throughout your current billing period."
      />

      {/* SUMMARY */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <Card className="md:col-span-2">

          <div className="flex items-start justify-between">

            <div>
              <p className="eyebrow">
                This billing period
              </p>

              <div className="mt-4 flex items-baseline gap-2">

                <span className="text-4xl font-semibold tracking-[-0.045em]">
                  {summary?.currentPeriodUsage.toLocaleString()}
                </span>

                <span className="text-sm text-[var(--st-text-muted)]">
                  /{" "}
                  {summary?.maxUsage.toLocaleString()} calls
                </span>

              </div>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--st-border)]">
              <Activity
                size={16}
                className="text-[var(--st-action)]"
              />
            </div>

          </div>

          <div className="mt-8">

            <div className="mb-2 flex justify-between text-xs">

              <span className="text-[var(--st-text-faint)]">
                Usage
              </span>

              <span className="font-medium">
                {percentUsed}%
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[var(--st-surface-hover)]">

              <div
                className="h-full rounded-full bg-[var(--st-action)] transition-all duration-500"
                style={{
                  width: `${percentUsed}%`,
                }}
              />

            </div>

          </div>

        </Card>

        <Card className="flex flex-col justify-between">

          <div>

            <p className="eyebrow">
              Remaining
            </p>

            <p className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              {summary
                ? Math.max(
                    0,
                    summary.maxUsage -
                      summary.currentPeriodUsage
                  ).toLocaleString()
                : "—"}
            </p>

            <p className="mt-2 text-sm text-[var(--st-text-muted)]">
              API calls available this period.
            </p>

          </div>

          <Button
            className="mt-8 w-full"
            onClick={() =>
              mutation.mutate(
                Math.floor(
                  Math.random() * 40
                ) + 10
              )
            }
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Recording..."
              : "Simulate 10–50 calls"}

            <ArrowUpRight size={15} />

          </Button>

        </Card>

      </div>

      {/* CHART */}

      <Card className="overflow-hidden p-0">

        <div className="border-b border-[var(--st-border)] px-6 py-5">

          <p className="eyebrow">
            Activity
          </p>

          <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
            Daily API usage
          </h2>

          <p className="mt-1 text-sm text-[var(--st-text-muted)]">
            Last 30 days
          </p>

        </div>

        <div className="p-6">

          {chartData.length > 0 ? (
            <AreaChart
              data={chartData}
              index="date"
              categories={["API Calls"]}
              colors={["red"]}
              className="h-72"
              showLegend={false}
              showGridLines={false}
            />
          ) : (
            <div className="flex h-72 flex-col items-center justify-center text-center">

              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--st-border)]">
                <Activity
                  size={17}
                  className="text-[var(--st-text-faint)]"
                />
              </div>

              <p className="mt-4 text-sm font-medium">
                No usage recorded yet
              </p>

              <p className="mt-1 max-w-xs text-sm text-[var(--st-text-muted)]">
                Simulate a few API calls to see
                your usage trend here.
              </p>

            </div>
          )}

        </div>

      </Card>

      {mutation.isError && (
        <p className="text-sm text-[var(--st-danger)]">
          {(mutation.error as {
            response?: {
              data?: {
                error?: string
              }
            }
          })?.response?.data?.error ??
            "Usage limit exceeded"}
        </p>
      )}

    </div>
  )
}