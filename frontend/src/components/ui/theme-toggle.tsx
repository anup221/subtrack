import { Sun, Moon } from "lucide-react"
import { useThemeStore } from "@/store/themeStore"

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  const isDark = theme === "dark"

  return (
    <button
      onClick={toggleTheme}
      className={[
        "group",
        "flex",
        "w-full",
        "items-center",
        "justify-between",
        "rounded-lg",
        "border",
        "border-[var(--st-border)]",
        "bg-[var(--st-surface)]",
        "px-3",
        "py-2.5",
        "text-sm",
        "text-[var(--st-text-muted)]",
        "transition-all",
        "duration-200",
        "hover:border-[var(--st-border-strong)]",
        "hover:bg-[var(--st-surface-hover)]",
        "hover:text-[var(--st-text)]",
      ].join(" ")}
      aria-label="Toggle theme"
    >
      <span>
        {isDark
          ? "Switch to light"
          : "Switch to dark"}
      </span>

      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--st-border)] bg-[var(--st-bg)] transition-transform duration-200 group-hover:scale-105">
        {isDark ? (
          <Sun size={14} />
        ) : (
          <Moon size={14} />
        )}
      </span>
    </button>
  )
}