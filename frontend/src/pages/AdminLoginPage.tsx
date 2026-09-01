import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"

import {
  adminLogin,
  adminSignup,
  googleAdminLoginUrl,
} from "@/lib/api"

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

export default function AdminLoginPage() {
  const navigate = useNavigate()

  const setAdminSession = useAppStore(
    (state) => state.setAdminSession
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams] = useSearchParams()

  const initialOAuthError =
    searchParams.get("oauth") === "error"
      ? "Google sign-in could not be completed. Use your admin credentials instead."
      : ""

  const [error, setError] = useState(initialOAuthError)
  const [loading, setLoading] = useState(false)
  const [signupMode, setSignupMode] = useState(false)
  const [bootstrapCode, setBootstrapCode] = useState("")

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError("")
    setLoading(true)

    try {
      const data = signupMode
        ? await adminSignup(email, password, bootstrapCode)
        : await adminLogin(email, password)

      setAdminSession(
        data.token,
        data.email
      )

      navigate("/admin", { replace: true })
    } catch (err: unknown) {
      const errData = (err as {
        response?: {
          data?: unknown
        }
      })?.response?.data

      const message =
        typeof errData === "string"
          ? errData
          : (errData as { message?: string } | undefined)
              ?.message

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

            <div className="st-logo-mark mx-auto mb-5 h-12 w-12 rounded-xl">
              <ShieldCheck size={24} strokeWidth={1.8} className="st-logo-glyph" />
            </div>

            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--st-text-faint)]">
              Platform administration
            </p>

            <h1 className="text-3xl font-semibold tracking-[-0.04em]">
              {signupMode ? "Create admin account" : "Admin login"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--st-text-muted)]">
              Sign in to manage SubTrack organizations.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-[var(--st-border)] bg-[var(--st-surface)] p-6 shadow-[inset_0_1px_0_var(--edge),var(--st-shadow-md)]">

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

              {signupMode && (
                <div className="space-y-2">
                  <label htmlFor="bootstrap-code" className="text-xs font-medium">Bootstrap code</label>
                  <Input id="bootstrap-code" type="password" autoComplete="off" value={bootstrapCode}
                    onChange={(event) => setBootstrapCode(event.target.value)} required />
                </div>
              )}

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
                  : signupMode ? "Create admin account" : "Sign in as admin"}
              </Button>
            </form>

            <button type="button" className="mt-4 w-full text-sm text-[var(--st-accent)] hover:underline"
              onClick={() => { setSignupMode((value) => !value); setError("") }}>
              {signupMode ? "Already have an account? Sign in" : "Create the first admin account"}
            </button>

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
              <GoogleIcon />
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
