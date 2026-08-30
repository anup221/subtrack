import { Sun, Moon } from "lucide-react"
import { useThemeStore } from "@/store/themeStore"

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#8b8b9c] hover:bg-white/5 hover:text-white transition-colors w-full"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  )
}
