import { useState } from "react"
import type { ReactNode } from "react"

import {
  useLocation,
  useNavigate,
} from "react-router-dom"

import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  LogOut,
  ArrowUpRight,
  Building2,
  Tags,
  Menu,
  X,
} from "lucide-react"

import { useAppStore } from "@/store/appStore"

import { ThemeToggle } from "@/components/ui/theme-toggle"

import { cn } from "@/lib/utils"

const workspaceNav = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Plans",
    path: "/pricing",
    icon: Tags,
  },
  {
    label: "Usage",
    path: "/usage",
    icon: BarChart3,
  },
  {
    label: "Billing",
    path: "/billing",
    icon: CreditCard,
  },
]

function NavButton({
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  label: string
  icon: typeof LayoutDashboard
  active: boolean
  onNavigate: () => void
}) {
  return (
    <button
      type="button"
      onClick={onNavigate}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-180",
        active
          ? [
              "bg-[var(--st-surface-hover)]",
              "text-[var(--st-text)]",
            ].join(" ")
          : [
              "text-[var(--st-text-muted)]",
              "hover:bg-[var(--st-surface-hover)]",
              "hover:text-[var(--st-text)]",
            ].join(" ")
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-[var(--accent-gradient)] shadow-[0_0_10px_color-mix(in_srgb,var(--accent)_60%,transparent)]" />
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

      {active && (
        <ArrowUpRight
          size={13}
          className="ml-auto text-[var(--st-text-faint)]"
        />
      )}
    </button>
  )
}

export function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const location = useLocation()
  const navigate = useNavigate()

  const email = useAppStore((s) => s.email)
  const role = useAppStore((s) => s.role)
  const logout = useAppStore((s) => s.logout)

  const [open, setOpen] = useState(false)

  const canSeeOrg =
    role === "OWNER" ||
    role === "ADMIN"

  function handleLogout() {
    logout()
    navigate("/login")
  }

  const sidebar = (
    <>
      {/* Brand */}
      <div className="mb-10 px-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="group flex items-center gap-3"
        >
          <div className="st-logo-mark st-logo-glyph h-9 w-9 rounded-lg text-base transition-transform duration-200 group-hover:scale-105">
            S
          </div>

          <div className="text-left">
            <p className="display text-[15px] tracking-[-0.02em]">
              SubTrack
            </p>

            <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--st-text-faint)]">
              Billing infrastructure
            </p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-8">

        {/* Workspace */}
        <div>
          <p className="eyebrow mb-2 px-3">
            Workspace
          </p>

          <div className="space-y-1">
            {workspaceNav.map((item) => (
              <NavButton
                key={item.path}
                label={item.label}
                icon={item.icon}
                active={location.pathname === item.path}
                onNavigate={() => {
                  navigate(item.path)
                  setOpen(false)
                }}
              />
            ))}
          </div>
        </div>

        {/* Organization */}
        {canSeeOrg && (
          <div>
            <p className="eyebrow mb-2 px-3">
              Organization
            </p>

            <NavButton
              label="Owner console"
              icon={Building2}
              active={location.pathname === "/organization"}
              onNavigate={() => {
                navigate("/organization")
                setOpen(false)
              }}
            />
          </div>
        )}
      </nav>

      {/* Account */}
      <div className="space-y-3 border-t border-[var(--st-border)] pt-5">

        <div className="rounded-lg border border-[var(--st-border)] bg-[var(--st-surface)] p-3 shadow-[inset_0_1px_0_var(--edge)]">
          <div className="flex items-center gap-2">
            <span className="st-status-dot text-[var(--success)]" />

            <p className="truncate text-xs font-medium">
              {email}
            </p>
          </div>

          <p className="mt-1 pl-3.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--st-text-faint)]">
            {role}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            onClick={handleLogout}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--st-border)] px-3 py-2 text-sm text-[var(--st-text-muted)] transition-colors hover:border-[var(--danger-border)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-[var(--st-bg)]">

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[258px] shrink-0 flex-col border-r border-[var(--st-border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-5 backdrop-blur-xl lg:flex">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">

          <button
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />

          <aside className="relative z-10 flex h-full w-[280px] flex-col border-r border-[var(--st-border)] bg-[color-mix(in_srgb,var(--surface)_95%,transparent)] p-5 backdrop-blur-xl">
            <button
              className="mb-5 self-end rounded-lg p-2 text-[var(--st-text-muted)] hover:bg-[var(--st-surface-hover)] hover:text-[var(--st-text)]"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--st-border)] bg-[color-mix(in_srgb,var(--background)_80%,transparent)] px-4 py-3 backdrop-blur-xl lg:hidden">

          <button
            onClick={() => setOpen(true)}
            className="rounded-xl border border-[var(--st-border)] p-2 text-[var(--st-text-muted)] hover:bg-[var(--st-surface-hover)] hover:text-[var(--st-text)]"
            aria-label="Open menu"
          >
            <Menu size={17} />
          </button>

          <span className="display text-[15px] tracking-[-0.02em]">
            SubTrack
          </span>

          <div className="ml-auto">
            <ThemeToggle size="sm" />
          </div>
        </header>

        <main className="min-h-screen flex-1 p-6 md:p-10 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  )
}
