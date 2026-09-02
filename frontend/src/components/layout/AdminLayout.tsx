import { useState } from "react"
import type { ReactNode } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Building2,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react"

import { useAppStore } from "@/store/appStore"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

const adminNav = [
  {
    label: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Tenants",
    path: "/admin/tenants",
    icon: Building2,
  },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const email = useAppStore((s) => s.email)
  const logout = useAppStore((s) => s.logout)
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate("/admin/login")
  }

  function isActive(path: string) {
    if (path === "/admin") {
      return location.pathname === "/admin"
    }

    return location.pathname.startsWith(path)
  }

  function NavItem({
    path,
    label,
    icon: Icon,
    onNavigate,
  }: {
    path: string
    label: string
    icon: typeof LayoutDashboard
    onNavigate: () => void
  }) {
    const active = isActive(path)

    return (
      <button
        type="button"
        onClick={onNavigate}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm transition-all duration-150",
          active
            ? "bg-[var(--st-surface-hover)] text-[var(--st-text)]"
            : "text-[var(--st-text-muted)] hover:bg-[var(--st-surface-hover)] hover:text-[var(--st-text)]"
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[var(--accent-gradient)] shadow-[0_0_10px_color-mix(in_srgb,var(--accent)_60%,transparent)]" />
        )}

        <Icon
          size={16}
          strokeWidth={active ? 2 : 1.7}
          className={cn(
            "transition-colors",
            active
              ? "text-[var(--accent)]"
              : "text-[var(--st-text-faint)] group-hover:text-[var(--st-text)]"
          )}
        />

        <span>{label}</span>
      </button>
    )
  }

  const brand = (
    <button
      type="button"
      onClick={() => navigate("/admin")}
      className="group flex items-center gap-3"
    >
      <div className="st-logo-mark h-9 w-9 rounded-lg">
        <ShieldCheck size={16} strokeWidth={2} className="st-logo-glyph" />
      </div>

      <div className="text-left">
        <p className="display text-[15px] tracking-[-0.02em]">
          SubTrack
        </p>

        <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--st-action)]">
          Admin console
        </p>
      </div>
    </button>
  )

  return (
    <div className="min-h-screen bg-[var(--st-bg)] text-[var(--st-text)]">
      {/* =============================
          DESKTOP TOP BAR
      ============================= */}
      <header className="sticky top-0 z-40 border-b border-[var(--st-border)] bg-[color-mix(in_srgb,var(--background)_82%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {brand}

          <nav className="hidden items-center gap-1 md:flex">
            {adminNav.map((item) => (
              <NavItem
                key={item.path}
                {...item}
                onNavigate={() => navigate(item.path)}
              />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="hidden items-center gap-2.5 rounded-lg border border-[var(--st-border)] bg-[var(--st-surface)] py-1.5 pl-3 pr-4 sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--st-surface-hover)] font-mono text-[10px] font-semibold uppercase">
                {email
                  ? email[0].toUpperCase()
                  : "A"}
              </span>

              <span className="max-w-[160px] truncate text-xs font-medium">
                {email || "Admin"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden h-9 items-center gap-2 rounded-lg border border-[var(--st-border)] px-3 text-sm text-[var(--st-text-muted)] transition-colors hover:border-[var(--danger-border)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] sm:inline-flex"
            >
              <LogOut size={15} />
              Log out
            </button>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--st-border)] text-[var(--st-text-muted)] hover:bg-[var(--st-surface-hover)] hover:text-[var(--st-text)] md:hidden"
              aria-label="Open menu"
            >
              <Menu size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* =============================
          MOBILE DRAWER
      ============================= */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />

          <aside className="relative z-10 flex h-full w-[280px] flex-col border-r border-[var(--st-border)] bg-[color-mix(in_srgb,var(--surface)_95%,transparent)] p-5 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              {brand}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-[var(--st-text-muted)] hover:bg-[var(--st-surface-hover)] hover:text-[var(--st-text)]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="space-y-1">
              {adminNav.map((item) => (
                <NavItem
                  key={item.path}
                  {...item}
                  onNavigate={() => {
                    navigate(item.path)
                    setOpen(false)
                  }}
                />
              ))}
            </nav>

            <div className="mt-auto space-y-3 border-t border-[var(--st-border)] pt-5">
              <div className="flex items-center gap-2.5 rounded-lg border border-[var(--st-border)] bg-[var(--st-surface-hover)] p-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--st-surface-raised)] font-mono text-[10px] font-semibold uppercase">
                  {email ? email[0].toUpperCase() : "A"}
                </span>

                <span className="truncate text-xs font-medium">
                  {email || "Admin"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[var(--st-text-muted)] transition-colors hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  )
}