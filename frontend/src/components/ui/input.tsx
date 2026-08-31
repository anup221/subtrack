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
        "w-full rounded-[var(--radius)] border border-[var(--border-strong)]",
        "bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)]",
        "placeholder:text-[var(--text-faint)]",
        "transition-colors",
        "focus:border-[var(--text-faint)]",
        "focus:outline-none",
        "focus-visible:outline-2",
        "focus-visible:outline-[var(--ring)]",
        "focus-visible:outline-offset-1",
        className
      )}
      {...props}
    />
  )
}
