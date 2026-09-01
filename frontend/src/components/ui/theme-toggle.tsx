import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useThemeStore } from "@/store/themeStore"
import { cn } from "@/lib/utils"

export function ThemeToggle({
  className,
  size = "md",
}: {
  className?: string
  size?: "sm" | "md"
}) {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  const [spinning, setSpinning] = useState(false)

  const isDark = theme === "dark"

  function handleToggle() {
    setSpinning(true)
    toggleTheme()
    window.setTimeout(() => setSpinning(false), 350)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full transition-all duration-200",
        "border border-[var(--st-border)]",
        "text-[var(--st-text-muted)]",
        "hover:border-[var(--st-border-strong)] hover:bg-[var(--st-surface-hover)] hover:text-[var(--st-text)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--st-action)]",
        size === "sm" ? "h-8 w-8" : "h-9 w-9",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none transition-all duration-300",
          spinning && "rotate-[360deg] scale-75"
        )}
      >
        {isDark ? (
          <Sun
            size={size === "sm" ? 15 : 17}
            strokeWidth={1.8}
            className="transition-colors"
          />
        ) : (
          <Moon
            size={size === "sm" ? 15 : 17}
            strokeWidth={1.8}
            className="transition-colors"
          />
        )}
      </span>
    </button>
  )
}