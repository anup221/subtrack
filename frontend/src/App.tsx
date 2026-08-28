import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Shield, Zap, Receipt, Webhook, BarChart3, Users, Sparkles, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Users,
    title: "Multi-tenant by design",
    description: "Every organization's data is isolated at the request level via JWT-resolved tenant context.",
  },
  {
    icon: Zap,
    title: "Real-time usage metering",
    description: "Redis-backed atomic counters enforce plan limits instantly, with a Postgres audit trail.",
  },
  {
    icon: Receipt,
    title: "Automated invoicing",
    description: "Scheduled billing cycles generate itemized invoices from plan fees plus metered usage.",
  },
  {
    icon: Webhook,
    title: "Signed webhooks",
    description: "HMAC-signed payment callbacks with idempotent event processing — duplicates do nothing.",
  },
  {
    icon: BarChart3,
    title: "Owner vs platform views",
    description: "Organization owners manage their tenant. Platform admins see MRR, churn, and every org.",
  },
  {
    icon: Shield,
    title: "Dunning & recovery",
    description: "Failed payments retry automatically and suspend the subscription after repeated failures.",
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
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#22d3ee]">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-semibold tracking-tight">SubTrack</span>
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Log in
          </Button>
          <Button onClick={() => navigate("/signup")}>Get started</Button>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl space-y-6 px-6 pb-24 pt-16 text-center md:pt-24">
        <FadeIn>
          <span className="inline-block rounded-full border border-[#7c5cff]/40 bg-[#7c5cff]/10 px-3 py-1 text-xs font-medium text-[#c4b5fd]">
            Multi-tenant SaaS billing, built from scratch
          </span>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Billing infrastructure
            <br />
            that scales with your tenants
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="mx-auto max-w-2xl text-lg text-[#8b8b9c]">
            Subscriptions, usage-based limits, invoicing, and payment webhooks — with a dedicated
            owner console for each organization and a separate platform admin view.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button size="lg" onClick={() => navigate("/signup")}>
              Start free
              <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
              Log in
            </Button>
          </div>
        </FadeIn>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <FadeIn>
          <h2 className="mb-2 text-center text-2xl font-semibold">Everything a real billing system needs</h2>
          <p className="mb-12 text-center text-[#8b8b9c]">
            Owner workspace for one tenant. Admin console for the whole platform.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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

      <footer className="border-t border-[#262633] py-10 text-center space-y-2">
        <p className="text-sm text-[#8b8b9c]">Built with Spring Boot · PostgreSQL · Redis · React · TypeScript</p>
        <p className="text-xs text-[#5c5c6b]">
          SubTrack — a portfolio project demonstrating multi-tenant billing architecture.
        </p>
      </footer>
    </div>
  )
}

export default App
