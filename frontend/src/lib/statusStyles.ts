export const subscriptionStatusStyles: Record<string, string> = {
  TRIAL: "bg-[#fbbf24]/15 text-[#fbbf24] ring-1 ring-[#fbbf24]/20",
  ACTIVE: "bg-[#34d399]/15 text-[#34d399] ring-1 ring-[#34d399]/20",
  PAST_DUE: "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/20",
  CANCELED: "bg-[#f87171]/15 text-[#f87171] ring-1 ring-[#f87171]/20",
  NONE: "bg-white/10 text-[#8b8b9c] ring-1 ring-white/10",
}

export const paymentStatusStyles: Record<string, string> = {
  PAID: "bg-[#34d399]/15 text-[#34d399] ring-1 ring-[#34d399]/20",
  SUCCEEDED: "bg-[#34d399]/15 text-[#34d399] ring-1 ring-[#34d399]/20",
  FAILED: "bg-[#f87171]/15 text-[#f87171] ring-1 ring-[#f87171]/20",
  PENDING: "bg-[#fbbf24]/15 text-[#fbbf24] ring-1 ring-[#fbbf24]/20",
}
