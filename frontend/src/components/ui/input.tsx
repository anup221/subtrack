import { cn } from "@/lib/utils"
import { InputHTMLAttributes } from "react"

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md bg-black/30 border border-[#23232f] px-3 py-2 text-sm text-white placeholder:text-[#8b8b9c] focus:outline-none focus:ring-2 focus:ring-[#7c5cff]",
        className
      )}
      {...props}
    />
  )
}