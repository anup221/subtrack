import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AreaChart, ProgressBar } from "@tremor/react"
import { getUsageSummary, recordUsage } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"

export default function UsagePage() {
  const queryClient = useQueryClient()

  const { data: summary, isLoading } = useQuery({
    queryKey: ["usage-summary"],
    queryFn: getUsageSummary,
  })

  const mutation = useMutation({
    mutationFn: (quantity: number) => recordUsage(quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usage-summary"] })
    },
  })

  if (isLoading) {
    return <p className="text-[#8b8b9c]">Loading usage...</p>
  }

  const percentUsed = summary
    ? Math.min(100, Math.round((summary.currentPeriodUsage / summary.maxUsage) * 100))
    : 0

  const chartData =
    summary?.dailyBreakdown.map((point) => ({
      date: point.date,
      "API Calls": point.usage,
    })) ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="Metering"
        title="Usage"
        description="Live period counter from Redis, with a daily Postgres rollup for the chart."
      />

      <Card className="glow-border space-y-3">
        <p className="text-sm text-[#8b8b9c]">This billing period</p>
        <p className="text-2xl font-semibold">
          {summary?.currentPeriodUsage.toLocaleString()}{" "}
          <span className="text-base font-normal text-[#8b8b9c]">
            / {summary?.maxUsage.toLocaleString()} calls
          </span>
        </p>
        <ProgressBar value={percentUsed} color={percentUsed >= 90 ? "red" : "violet"} />
        <p className="text-xs text-[#8b8b9c]">{percentUsed}% of plan limit used</p>
      </Card>

      <Card>
        <p className="mb-4 text-sm text-[#8b8b9c]">Daily usage (last 30 days)</p>
        <AreaChart
          data={chartData}
          index="date"
          categories={["API Calls"]}
          colors={["violet"]}
          className="h-64"
        />
      </Card>

      <div className="space-y-2">
        <Button
          onClick={() => mutation.mutate(Math.floor(Math.random() * 40) + 10)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Recording..." : "Simulate 10–50 API calls"}
        </Button>
        {mutation.isError && (
          <p className="text-sm text-[#f87171]">
            {(mutation.error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
              "Usage limit exceeded"}
          </p>
        )}
      </div>
    </div>
  )
}
