import { cn } from "@/lib/utils"
import type { HTMLAttributes } from "react"

type Tone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "accent"

const tones: Record<Tone, string> = {
  neutral:
    "border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--text-muted)] shadow-[inset_0_1px_0_var(--edge)]",

  success:
    "border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[var(--success-soft)] text-[var(--success)] shadow-[0_4px_16px_-8px_color-mix(in_srgb,var(--success)_55%,transparent)]",

  warning:
    "border-[color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[var(--warning-soft)] text-[var(--warning)] shadow-[0_4px_16px_-8px_color-mix(in_srgb,var(--warning)_50%,transparent)]",

  danger:
    "border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[var(--danger-soft)] text-[var(--danger)] shadow-[0_4px_16px_-8px_color-mix(in_srgb,var(--danger)_50%,transparent)]",

  accent:
    "border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_4px_16px_-8px_color-mix(in_srgb,var(--accent)_55%,transparent)]",
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone
}) {
  return (
    <span
      className={cn(
        // Layout
        "inline-flex items-center gap-1.5",

        // Shape + spacing
        "rounded-full",
        "border px-2.5 py-1",

        // Typography
        "font-mono text-[10px] font-medium",
        "uppercase tracking-[0.12em]",
        "leading-none",

        // Tone
        tones[tone],

        // Prevent weird sizing
        "whitespace-nowrap",

        className
      )}
      {...props}
    />
  )
}