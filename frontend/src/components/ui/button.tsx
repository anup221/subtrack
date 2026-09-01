import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const variantStyles: Record<string, string> = {
  default: [
    "st-btn-primary",
  ].join(" "),

  destructive: [
    "bg-[var(--st-danger)]",
    "text-white",
    "shadow-[0_8px_24px_-10px_color-mix(in_srgb,var(--st-danger)_55%,transparent)]",
    "hover:brightness-95",
    "hover:-translate-y-px",
    "active:translate-y-px",
  ].join(" "),

  outline: [
    "border border-[var(--st-border-strong)]",
    "bg-[color-mix(in_srgb,var(--surface)_70%,transparent)]",
    "text-[var(--st-text)]",
    "shadow-[inset_0_1px_0_var(--edge)]",
    "backdrop-blur-md",
    "hover:bg-[var(--st-surface-hover)]",
    "hover:border-[color-mix(in_srgb,var(--accent)_45%,transparent)]",
    "hover:shadow-[0_8px_24px_-12px_color-mix(in_srgb,var(--accent)_35%,transparent)]",
    "hover:-translate-y-px",
    "active:translate-y-px",
  ].join(" "),

  secondary: [
    "bg-[var(--st-surface-hover)]",
    "text-[var(--st-text)]",
    "border border-[var(--st-border)]",
    "shadow-[inset_0_1px_0_var(--edge)]",
    "hover:bg-[var(--st-border-strong)]",
    "hover:-translate-y-px",
    "active:translate-y-px",
  ].join(" "),

  ghost: [
    "bg-transparent",
    "text-[var(--st-text-muted)]",
    "hover:bg-[var(--st-surface-hover)]",
    "hover:text-[var(--st-text)]",
  ].join(" "),

  link: [
    "bg-transparent",
    "text-[var(--st-action)]",
    "underline-offset-4",
    "hover:underline",
  ].join(" "),
}

const sizeStyles: Record<string, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3 text-xs",
  lg: "h-11 px-5",
  icon: "h-10 w-10",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "rounded-xl",
          "text-sm font-medium",
          "transition-all duration-150",
          "active:scale-[0.98]",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-[var(--st-action)]",
          "focus-visible:ring-offset-2",
          "focus-visible:ring-offset-[var(--background)]",
          "disabled:pointer-events-none",
          "disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }