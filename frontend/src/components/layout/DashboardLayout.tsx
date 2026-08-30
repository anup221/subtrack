import { ReactNode, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Users,
  LogOut,
  Sparkles,
  Building2,
  Tags,
  Menu,
  X,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

const workspaceNav = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Plans", path: "/pricing", icon: Tags },
  { label: "Usage", path: "/usage", icon: BarChart3 },
  { label: "Billing", path: "/billing", icon: CreditCard },
]

export function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const email = useAppStore((s) => s.email)
  const role = useAppStore((s) => s.role)
  const logout = useAppStore((s) => s.logout)
  const [open, setOpen] = useState(false)

  const isOwner = role === "OWNER"
  const isAdmin = role === "ADMIN"
  const canSeeOrgConsole = isOwner || isAdmin
  const canSeePlatform = isOwner || isAdmin

  function handleLogout() {
    logout()
    navigate("/login")
  }

  function NavButton({
    path,
    label,
    icon: Icon,
    accent,
  }: {
    path: string
    label: string
    icon: typeof LayoutDashboard
    accent?: "violet" | "cyan"
  }) {
    const active = location.pathname === path
    return (
      <button
        onClick={() => {
          navigate(path)
          setOpen(false)
        }}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
          active
            ? accent === "cyan"
              ? "border border-[color-mix(in_srgb,var(--accent-2)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent-2)_12%,transparent)] text-[var(--text)]"
              : "border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--text)]"
            : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
        )}
      >
        <Icon size={16} />
        {label}
      </button>
    )
  }

  const sidebar = (
    <>
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#22d3ee]">
          <Sparkles size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">SubTrack</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">Billing OS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5">
        <div className="space-y-1">
          <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--text-faint)]">
            Workspace
          </p>
          {workspaceNav.map((item) => (
            <NavButton key={item.path} {...item} />
          ))}
        </div>

        {canSeeOrgConsole && (
          <div className="space-y-1">
            <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--text-faint)]">
              Organization
            </p>
            <NavButton
              path="/organization"
              label="Owner console"
              icon={Building2}
              accent="cyan"
            />
          </div>
        )}

        {canSeePlatform && (
          <div className="space-y-1">
            <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--text-faint)]">
              Platform
            </p>
            <NavButton path="/admin" label="Admin console" icon={Users} accent="violet" />
          </div>
        )}
      </nav>

      <div className="space-y-3 border-t border-[var(--border)] pt-4">
        <div className="px-2">
          <p className="truncate text-sm">{email}</p>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">{role}</p>
        </div>
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[#f87171]"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen">
      <aside className="sidebar-bg sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--border)] p-5 backdrop-blur-xl lg:flex">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <aside className="relative z-50 flex h-full w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-5">
            <button
              className="mb-4 self-end rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="header-bg sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold">SubTrack</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-10">{children}</main>
      </div>
    </div>
  )
}