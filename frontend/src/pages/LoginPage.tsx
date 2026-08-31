import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
} from "lucide-react"

import { googleOrgLoginUrl, login } from "@/lib/api"
import { useAppStore } from "@/store/appStore"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function LoginPage() {
  const navigate = useNavigate()

  const setSession = useAppStore(
    (state) => state.setSession
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError("")

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    if (!password) {
      setError("Please enter your password.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    try {
      setLoading(true)

      const response = await login(
        email.trim(),
        password
      )

      setSession(response)

      navigate("/dashboard")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--st-bg)] text-[var(--st-text)]">
      {/* Header */}
      <header className="border-b border-[var(--st-border)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-[var(--st-radius)] bg-[var(--st-action)] font-mono text-[13px] font-medium text-[var(--st-action-text)]">
              S
            </span>

            <span className="display text-[19px]">
              SubTrack
            </span>
          </Link>

          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 lg:grid-cols-[1fr_480px]">
        {/* Desktop editorial panel */}
        <section className="hidden border-r border-[var(--st-border)] px-10 py-16 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link
              to="/"
              className="eyebrow inline-flex items-center gap-2 text-[var(--st-text-muted)] transition-colors hover:text-[var(--st-text)]"
            >
              <ArrowLeft size={13} />
              Back to home
            </Link>

            <div className="mt-24 max-w-xl">
              <p className="eyebrow mb-5">
                Welcome back
              </p>

              <h1 className="display text-[56px] leading-[1.02]">
                Your billing
                <br />
                workspace awaits.
              </h1>

              <p className="mt-6 max-w-md text-[15px] leading-7 text-[var(--st-text-muted)]">
                Manage subscriptions, usage, invoices and
                payments from one focused workspace.
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--st-border)] pt-7">
            <p className="eyebrow mb-5">
              Workspace
            </p>

            <div className="space-y-4">
              {[
                "Subscription and plan management",
                "Real-time usage metering",
                "Invoice and payment history",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-[var(--st-text-muted)]"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--st-border-strong)]">
                    <Check
                      size={11}
                      className="text-[var(--st-accent)]"
                    />
                  </span>

                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Login section */}
        <section className="flex items-center px-6 py-12 md:px-12">
          <div className="mx-auto w-full max-w-[390px]">

            {/* Mobile back link */}
            <Link
              to="/"
              className="eyebrow mb-12 inline-flex items-center gap-2 text-[var(--st-text-muted)] transition-colors hover:text-[var(--st-text)] lg:hidden"
            >
              <ArrowLeft size={13} />
              Back to home
            </Link>

            {/* Heading */}
            <div className="mb-9">
              <p className="eyebrow mb-4">
                Account access
              </p>

              <h2 className="display text-[42px] leading-tight">
                Sign in
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--st-text-muted)]">
                Enter your credentials to access your
                workspace.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  Email address
                </label>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={loading}
                  className="h-11"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium"
                >
                  Password
                </label>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    disabled={loading}
                    className="h-11 pr-11"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--st-text-muted)] transition-colors hover:text-[var(--st-text)] disabled:pointer-events-none disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="border border-[var(--st-border)] bg-[var(--st-surface)] px-4 py-3 text-sm text-[var(--st-text)]"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>

            <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => { window.location.href = googleOrgLoginUrl() }}>
              Continue with Google
            </Button>

            {/* Signup */}
            <div className="mt-8 border-t border-[var(--st-border)] pt-6 text-center">
              <p className="text-sm text-[var(--st-text-muted)]">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-[var(--st-text)] underline decoration-[var(--st-border-strong)] underline-offset-4 transition-colors hover:decoration-[var(--st-text)]"
                >
                  Create a workspace
                </Link>
              </p>
            </div>

            <p className="mt-10 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--st-text-muted)]">
              Secure workspace access
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
