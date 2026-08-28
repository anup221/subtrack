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
              ? "border border-[#22d3ee]/30 bg-[#22d3ee]/12 text-white"
              : "border border-[#7c5cff]/30 bg-[#7c5cff]/15 text-white"
            : "text-[#8b8b9c] hover:bg-white/5 hover:text-white"
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
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#5c5c6b]">Billing OS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5">
        <div className="space-y-1">
          <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#5c5c6b]">
            Workspace
          </p>
          {workspaceNav.map((item) => (
            <NavButton key={item.path} {...item} />
          ))}
        </div>

        {canSeeOrgConsole && (
          <div className="space-y-1">
            <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#5c5c6b]">
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
            <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#5c5c6b]">
              Platform
            </p>
            <NavButton path="/admin" label="Admin console" icon={Users} accent="violet" />
          </div>
        )}
      </nav>

      <div className="space-y-3 border-t border-[#262633] pt-4">
        <div className="px-2">
          <p className="truncate text-sm">{email}</p>
          <p className="mt-0.5 text-xs text-[#8b8b9c]">{role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#8b8b9c] transition-colors hover:bg-white/5 hover:text-[#f87171]"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#262633] bg-[#0c0c14]/80 p-5 backdrop-blur-xl lg:flex">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <aside className="relative z-50 flex h-full w-64 flex-col border-r border-[#262633] bg-[#0c0c14] p-5">
            <button
              className="mb-4 self-end rounded-lg p-1 text-[#8b8b9c] hover:text-white"
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
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#262633] bg-[#07070c]/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-[#8b8b9c] hover:bg-white/5 hover:text-white"
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
