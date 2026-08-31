import {
  ReactNode,
  useState,
} from "react"

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
  Circle,
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

  function NavButton({
    path,
    label,
    icon: Icon,
  }: {
    path: string
    label: string
    icon: typeof LayoutDashboard
  }) {
    const active =
      location.pathname === path

    return (
      <button
        onClick={() => {
          navigate(path)
          setOpen(false)
        }}
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
          <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-[var(--st-accent)]" />
        )}

        <Icon
          size={16}
          strokeWidth={active ? 2 : 1.7}
          className={cn(
            "transition-colors",
            active
              ? "text-[var(--st-accent)]"
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

  const sidebar = (
    <>
      {/* Brand */}
      <div className="mb-10 px-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="group flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--st-border-strong)] bg-[var(--st-text)] text-[var(--st-bg)] transition-transform duration-200 group-hover:scale-105">
            <span className="font-serif text-lg">
              S
            </span>
          </div>

          <div className="text-left">
            <p className="text-sm font-semibold tracking-[-0.02em]">
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
                {...item}
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
              path="/organization"
              label="Owner console"
              icon={Building2}
            />
          </div>
        )}
      </nav>

      {/* Account */}
      <div className="space-y-3 border-t border-[var(--st-border)] pt-5">

        <div className="rounded-lg border border-[var(--st-border)] bg-[var(--st-surface)] p-3">
          <div className="flex items-center gap-2">
            <Circle
              size={7}
              fill="currentColor"
              className="text-[var(--success)]"
            />

            <p className="truncate text-xs font-medium">
              {email}
            </p>
          </div>

          <p className="mt-1 pl-3.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--st-text-faint)]">
            {role}
          </p>
        </div>

        <ThemeToggle />

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--st-text-muted)] transition-colors hover:bg-[var(--st-surface-hover)] hover:text-[var(--danger)]"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-[var(--st-bg)]">

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[258px] shrink-0 flex-col border-r border-[var(--st-border)] bg-[var(--st-surface)] p-5 lg:flex">
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

          <aside className="relative z-10 flex h-full w-[280px] flex-col border-r border-[var(--st-border)] bg-[var(--st-surface)] p-5">
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
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--st-border)] bg-[var(--st-bg)]/90 px-4 py-3 backdrop-blur-xl lg:hidden">

          <button
            onClick={() => setOpen(true)}
            className="rounded-lg border border-[var(--st-border)] p-2 text-[var(--st-text-muted)] hover:bg-[var(--st-surface-hover)] hover:text-[var(--st-text)]"
            aria-label="Open menu"
          >
            <Menu size={17} />
          </button>

          <span className="font-semibold tracking-[-0.02em]">
            SubTrack
          </span>
        </header>

        <main className="min-h-screen flex-1 p-6 md:p-10 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  )
}