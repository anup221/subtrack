import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const variantStyles: Record<string, string> = {
  default: "bg-[#7c5cff] text-white hover:bg-[#6a4be0]",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-[#23232f] bg-transparent hover:bg-white/5",
  secondary: "bg-[#14141f] text-white hover:bg-[#1c1c2a]",
  ghost: "hover:bg-white/5",
  link: "text-[#7c5cff] underline-offset-4 hover:underline",
}

const sizeStyles: Record<string, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-8",
  icon: "h-10 w-10",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cff] disabled:opacity-50 disabled:pointer-events-none",
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