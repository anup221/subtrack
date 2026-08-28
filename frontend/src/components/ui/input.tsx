import { cn } from "@/lib/utils"
import { InputHTMLAttributes } from "react"

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-[#262633] bg-black/35 px-3 py-2.5 text-sm text-white placeholder:text-[#5c5c6b] transition-colors focus:border-[#7c5cff]/50 focus:outline-none focus:ring-2 focus:ring-[#7c5cff]/40",
        className
      )}
      {...props}
    />
  )
}
