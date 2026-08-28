import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Shield, Zap, Receipt, Webhook, BarChart3, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Users,
    title: "Multi-Tenant by Design",
    description: "Every organization's data is isolated at the request level via JWT-resolved tenant context — no cross-tenant leaks, ever.",
  },
  {
    icon: Zap,
    title: "Real-Time Usage Metering",
    description: "Redis-backed atomic counters enforce plan limits instantly, with a permanent Postgres audit trail behind every event.",
  },
  {
    icon: Receipt,
    title: "Automated Invoicing",
    description: "Scheduled billing cycles generate itemized invoices combining flat plan fees with real, metered usage data.",
  },
  {
    icon: Webhook,
    title: "Signed Webhooks",
    description: "HMAC-signed payment callbacks with idempotent event processing — the same event delivered twice has zero extra effect.",
  },
  {
    icon: BarChart3,
    title: "Business Metrics, Built In",
    description: "MRR, churn rate, and tenant-level visibility for admins — computed straight from live subscription data.",
  },
  {
    icon: Shield,
    title: "Dunning & Recovery",
    description: "Failed payments automatically trigger retry logic and subscription suspension after repeated failures — no manual intervention.",
  },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

function App() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <span className="font-semibold text-lg tracking-tight">SubTrack</span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/login")}>Log In</Button>
          <Button onClick={() => navigate("/signup")}>Get Started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-24 space-y-6">
        <FadeIn>
          <span className="inline-block text-xs font-medium px-3 py-1 rounded-full border border-[#7c5cff]/40 text-[#c4b5fd] bg-[#7c5cff]/10">
            Multi-tenant SaaS billing, built from scratch
          </span>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Billing infrastructure<br />that scales with your tenants
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-[#8b8b9c] text-lg max-w-2xl mx-auto">
            SubTrack handles subscriptions, usage-based limits, invoicing, and payment
            webhooks for multi-tenant SaaS products — the same category of system behind
            Stripe Billing and Chargebee, built end-to-end with Spring Boot and React.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button size="lg" onClick={() => navigate("/signup")}>Start Free</Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}>Log In</Button>
          </div>
        </FadeIn>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <FadeIn>
          <h2 className="text-2xl font-semibold text-center mb-2">Everything a real billing system needs</h2>
          <p className="text-[#8b8b9c] text-center mb-12">Not a toy CRUD app — the actual hard parts of SaaS billing.</p>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.05}>
              <Card className="h-full space-y-3">
                <feature.icon size={22} className="text-[#7c5cff]" />
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-[#8b8b9c]">{feature.description}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Tech footer */}
      <footer className="border-t border-[#23232f] py-10 text-center space-y-2">
        <p className="text-sm text-[#8b8b9c]">
          Built with Spring Boot · PostgreSQL · Redis · React · TypeScript
        </p>
        <p className="text-xs text-[#5c5c6b]">SubTrack — a portfolio project demonstrating multi-tenant billing architecture.</p>
      </footer>
    </div>
  )
}

export default App