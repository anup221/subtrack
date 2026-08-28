import { ReactNode } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, CreditCard, BarChart3, Users, LogOut, Sparkles } from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Usage", path: "/usage", icon: BarChart3 },
  { label: "Billing", path: "/billing", icon: CreditCard },
]

export function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const email = useAppStore((s) => s.email)
  const role = useAppStore((s) => s.role)
  const logout = useAppStore((s) => s.logout)
  const isAdmin = role === "OWNER" || role === "ADMIN"

  function handleLogout() {
    logout()
    navigate("/login")
  }

  function NavButton({ path, label, icon: Icon }: { path: string; label: string; icon: typeof LayoutDashboard }) {
    const active = location.pathname === path
    return (
      <button
        onClick={() => navigate(path)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
          active
            ? "bg-[#7c5cff]/15 text-white border border-[#7c5cff]/30"
            : "text-[#8b8b9c] hover:bg-white/5 hover:text-white"
        )}
      >
        <Icon size={16} />
        {label}
      </button>
    )
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-[#24242f] flex flex-col p-5 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Sparkles size={18} className="text-[#7c5cff]" />
          <span className="font-semibold tracking-tight">SubTrack</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavButton key={item.path} {...item} />
          ))}
          {isAdmin && <NavButton path="/admin" label="Admin" icon={Users} />}
        </nav>

        <div className="border-t border-[#24242f] pt-4 space-y-3">
          <div className="px-2">
            <p className="text-sm truncate">{email}</p>
            <p className="text-xs text-[#8b8b9c]">{role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#8b8b9c] hover:bg-white/5 hover:text-[#f87171] transition-colors"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">{children}</main>
    </div>
  )
}
