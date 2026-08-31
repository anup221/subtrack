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
  default:
    [
      "bg-[var(--st-action)]",
      "text-[var(--st-action-text)]",
      "shadow-sm",
      "hover:bg-[var(--st-action-hover)]",
      "active:translate-y-px",
    ].join(" "),

  destructive:
    [
      "bg-[var(--st-danger)]",
      "text-white",
      "hover:brightness-95",
    ].join(" "),

  outline:
    [
      "border border-[var(--st-border-strong)]",
      "bg-transparent",
      "text-[var(--st-text)]",
      "hover:bg-[var(--st-surface-hover)]",
    ].join(" "),

  secondary:
    [
      "bg-[var(--st-surface-hover)]",
      "text-[var(--st-text)]",
      "hover:bg-[var(--st-border)]",
    ].join(" "),

  ghost:
    [
      "bg-transparent",
      "text-[var(--st-text-muted)]",
      "hover:bg-[var(--st-surface-hover)]",
      "hover:text-[var(--st-text)]",
    ].join(" "),

  link:
    [
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
          "rounded-lg",
          "text-sm font-medium",
          "transition-all duration-150",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-[var(--st-action)]",
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