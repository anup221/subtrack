const base = "border"

const tone = {
  success: `${base} bg-[var(--success-soft)] text-[var(--success)] border-[color-mix(in_srgb,var(--success)_35%,transparent)]`,

  warning: `${base} bg-[var(--warning-soft)] text-[var(--warning)] border-[color-mix(in_srgb,var(--warning)_35%,transparent)]`,

  danger: `${base} bg-[var(--danger-soft)] text-[var(--danger)] border-[color-mix(in_srgb,var(--danger)_35%,transparent)]`,

  neutral: `${base} bg-[var(--surface-sunken)] text-[var(--text-muted)] border-[var(--border)]`,
}

export const subscriptionStatusStyles: Record<string, string> = {
  TRIAL: tone.warning,
  ACTIVE: tone.success,
  PAST_DUE: tone.warning,
  CANCELED: tone.danger,
  NONE: tone.neutral,
}

export const paymentStatusStyles: Record<string, string> = {
  PAID: tone.success,
  SUCCEEDED: tone.success,
  FAILED: tone.danger,
  PENDING: tone.warning,
  REFUNDED: tone.neutral,
}