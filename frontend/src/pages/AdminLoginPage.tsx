import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"

import {
  adminLogin,
  googleAdminLoginUrl,
} from "@/lib/api"

import { useAppStore } from "@/store/appStore"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"


export default function AdminLoginPage() {
  const navigate = useNavigate()

  const setAdminSession = useAppStore(
    (state) => state.setAdminSession
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError("")
    setLoading(true)

    try {
      const data = await adminLogin(email, password)

      setAdminSession(
        data.token,
        data.email
      )

      navigate("/admin", { replace: true })
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Invalid admin credentials"

      setError(
        typeof message === "string"
          ? message
          : "Invalid admin credentials"
      )
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleLogin() {
    window.location.href = googleAdminLoginUrl()
  }

  return (
    <div className="min-h-screen bg-[var(--st-bg)] text-[var(--st-text)]">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
        <div className="w-full">

          {/* Header */}
          <div className="mb-8 text-center">

            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--st-border-strong)] bg-[var(--st-text)] text-[var(--st-bg)]">
              <ShieldCheck size={23} strokeWidth={1.8} />
            </div>

            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--st-text-faint)]">
              Platform administration
            </p>

            <h1 className="text-3xl font-semibold tracking-[-0.04em]">
              Admin login
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--st-text-muted)]">
              Sign in to manage SubTrack organizations.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-[var(--st-border)] bg-[var(--st-surface)] p-6 shadow-sm">

            {error && (
              <div className="mb-5 rounded-lg border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[var(--danger-soft)] px-3.5 py-3 text-sm text-[var(--danger)]">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div className="space-y-2">
                <label
                  htmlFor="admin-email"
                  className="text-xs font-medium"
                >
                  Email
                </label>

                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="admin-password"
                  className="text-xs font-medium"
                >
                  Password
                </label>

                <div className="relative">
                  <Input
                    id="admin-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    className="pr-10"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--st-text-faint)] transition-colors hover:text-[var(--st-text)]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading
                  ? "Signing in..."
                  : "Sign in as admin"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--st-border)]" />

              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--st-text-faint)]">
                or
              </span>

              <div className="h-px flex-1 bg-[var(--st-border)]" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full"
            >
              Continue with Google
            </Button>
          </div>

          {/* Switch back to organization login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--st-text-muted)]">
              Need organization access?{" "}
              <Link
                to="/login"
                className="font-medium text-[var(--st-accent)] hover:underline"
              >
                Organization login
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}