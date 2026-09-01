import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
} from "lucide-react"

import { signup, googleOrgLoginUrl } from "@/lib/api"
import { useAppStore } from "@/store/appStore"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const schema = z.object({
  organizationName: z
    .string()
    .min(2, "Organization name is required"),

  email: z
    .string()
    .email("Enter a valid email"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
})

type FormData = z.infer<typeof schema>

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

export default function SignupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const oauthErrorParam = searchParams.get("oauth")

  const setSession = useAppStore(
    (state) => state.setSession
  )

  const [showPassword, setShowPassword] =
    useState(false)

  const [submitError, setSubmitError] =
    useState(
      oauthErrorParam === "error"
        ? "Google sign-in could not be completed. Please create a workspace with your email and password."
        : ""
    )

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setSubmitError("")

    try {
      const response = await signup(
        data.organizationName,
        data.email,
        data.password
      )

      setSession(response)

      navigate("/dashboard")
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Signup failed. Please try again."
      )
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Top navigation */}
      <header className="border-b border-[var(--border)]">
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
        {/* Left panel */}
        <section className="hidden border-r border-[var(--border)] px-10 py-16 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link
              to="/"
              className="eyebrow inline-flex items-center gap-2 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              <ArrowLeft size={13} />
              Back to home
            </Link>

            <div className="mt-24 max-w-xl">
              <p className="eyebrow mb-5">
                Start building
              </p>

              <h1 className="display text-[56px] leading-[1.02]">
                Your billing
                <br />
                workspace starts here.
              </h1>

              <p className="mt-6 max-w-md text-[15px] leading-7 text-[var(--text-muted)]">
                Create an organization and get a dedicated
                workspace for subscriptions, usage,
                invoices, and payments.
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-7">
            <p className="eyebrow mb-5">
              Included
            </p>

            <div className="space-y-4">
              {[
                "Free trial subscription",
                "Usage metering and limits",
                "Invoice and payment tracking",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-[var(--text-muted)]"
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

        {/* Signup form */}
        <section className="flex items-center px-6 py-12 md:px-12">
          <div className="mx-auto w-full max-w-[390px]">
            {/* Mobile back link */}
            <Link
              to="/"
              className="eyebrow mb-12 inline-flex items-center gap-2 text-[var(--text-muted)] transition-colors hover:text-[var(--text)] lg:hidden"
            >
              <ArrowLeft size={13} />
              Back to home
            </Link>

            <div className="mb-9">
              <p className="eyebrow mb-4">
                New workspace
              </p>

              <h2 className="display text-[42px] leading-tight">
                Create account
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                Set up your organization and owner account.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Organization */}
              <div className="space-y-2">
                <label
                  htmlFor="organizationName"
                  className="text-sm font-medium"
                >
                  Organization name
                </label>

                <Input
                  id="organizationName"
                  placeholder="Acme Inc."
                  autoComplete="organization"
                  disabled={isSubmitting}
                  {...register("organizationName")}
                />

                {errors.organizationName && (
                  <p className="text-sm text-[var(--danger)]">
                    {errors.organizationName.message}
                  </p>
                )}
              </div>

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
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  {...register("email")}
                />

                {errors.email && (
                  <p className="text-sm text-[var(--danger)]">
                    {errors.email.message}
                  </p>
                )}
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
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    className="pr-11"
                    {...register("password")}
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
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] transition-colors hover:text-[var(--text)] disabled:pointer-events-none disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-sm text-[var(--danger)]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* API error */}
              {submitError && (
                <div
                  role="alert"
                  className="border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]"
                >
                  {submitError}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="mt-2 w-full"
              >
                {isSubmitting ? (
                  "Creating workspace..."
                ) : (
                  <>
                    Create workspace
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>

            <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => { window.location.href = googleOrgLoginUrl() }}>
              <GoogleIcon />
              Continue with Google
            </Button>

            {/* Login */}
            <div className="mt-8 border-t border-[var(--border)] pt-6 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:decoration-[var(--text)]"
                >
                  Log in
                </Link>
              </p>
            </div>

            <p className="mt-10 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
              Free plan · No credit card required
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}