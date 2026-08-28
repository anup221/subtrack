import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const variantStyles: Record<string, string> = {
  default:
    "bg-gradient-to-r from-[#7c5cff] to-[#6a4be0] text-white shadow-[0_0_20px_rgba(124,92,255,0.25)] hover:brightness-110",
  destructive: "bg-[#f87171] text-[#0a0a0f] hover:bg-[#fb8a8a]",
  outline: "border border-[#262633] bg-transparent hover:border-[#7c5cff]/40 hover:bg-white/5",
  secondary: "bg-[#171722] text-white hover:bg-[#1e1e2a]",
  ghost: "hover:bg-white/5",
  link: "text-[#a78bfa] underline-offset-4 hover:underline",
}

const sizeStyles: Record<string, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3 text-xs",
  lg: "h-11 px-8",
  icon: "h-10 w-10",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cff] disabled:pointer-events-none disabled:opacity-50",
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
