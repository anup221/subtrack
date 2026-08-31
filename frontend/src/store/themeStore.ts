import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "dark" | "light"

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark"

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark"
}

type ThemeState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getSystemTheme(),

      setTheme: (theme) => {
        set({ theme })
      },

      toggleTheme: () => {
        set({
          theme: get().theme === "dark" ? "light" : "dark",
        })
      },
    }),
    {
      name: "subtrack-theme",
    }
  )
)