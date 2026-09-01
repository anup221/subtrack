import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
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

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const oauthErrorParam = searchParams.get("oauth")

  const setSession = useAppStore(
    (state) => state.setSession
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(
    oauthErrorParam === "error"
      ? "Google sign-in could not be completed. Please sign in with your email and password."
      : ""
  )

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
            <span className="st-logo-mark st-logo-glyph h-8 w-8 rounded-lg text-[14px]">
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
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[var(--accent-soft)]">
                    <Check
                      size={11}
                      strokeWidth={3}
                      className="text-[var(--accent)]"
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
              <GoogleIcon />
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

            {/* Admin login */}
            <div className="mt-5 flex items-center gap-2 rounded-[var(--st-radius)] border border-dashed border-[var(--st-border-strong)] bg-[var(--st-surface)] px-4 py-3 text-sm">
              <span className="text-[var(--st-text-muted)]">
                Platform admin?
              </span>
              <Link
                to="/admin/login"
                className="ml-auto font-medium text-[var(--st-text)] underline decoration-[var(--st-border-strong)] underline-offset-4 transition-colors hover:decoration-[var(--st-text)]"
              >
                Admin login
              </Link>
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
