import { cn } from "@/lib/utils"
import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
} from "react"

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("eyebrow mb-1.5 block", className)}
      {...props}
    />
  )
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-[var(--border-strong)]",
        "bg-[var(--surface-raised)] px-3.5 py-2.5 text-sm text-[var(--text)]",
        "placeholder:text-[var(--text-faint)]",
        "shadow-[inset_0_1px_0_var(--edge),inset_0_1px_3px_rgba(0,0,0,0.12)]",
        "transition-all duration-150",
        "hover:border-[var(--text-faint)]",
        "focus:border-[var(--st-action)]",
        "focus:bg-[var(--surface)]",
        "focus:shadow-[0_0_0_4px_var(--ring),inset_0_1px_0_var(--edge)]",
        "focus:outline-none",
        className
      )}
      {...props}
    />
  )
}