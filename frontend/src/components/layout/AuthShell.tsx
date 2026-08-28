import { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles } from "lucide-react"

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  const navigate = useNavigate()

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-[#262633] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 text-left"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#22d3ee]">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-semibold">SubTrack</span>
        </button>
        <div className="max-w-md space-y-4">
          <p className="text-3xl font-semibold tracking-tight">
            Billing infrastructure for multi-tenant SaaS
          </p>
          <p className="text-[#8b8b9c]">
            Subscriptions, usage metering, invoices, and signed webhooks — isolated per organization.
          </p>
        </div>
        <p className="text-xs text-[#5c5c6b]">Spring Boot · PostgreSQL · Redis · React</p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 lg:hidden">
            <Sparkles size={16} className="text-[#7c5cff]" />
            <span className="font-semibold">SubTrack</span>
          </button>
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-[#8b8b9c]">{subtitle}</p>
          </div>
          {children}
          <div className="text-sm text-[#8b8b9c]">{footer}</div>
        </div>
      </div>
    </div>
  )
}
