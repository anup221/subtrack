import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
} from "lucide-react"

import { signup } from "@/lib/api"
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

export default function SignupPage() {
  const navigate = useNavigate()

  const setSession = useAppStore(
    (state) => state.setSession
  )

  const [showPassword, setShowPassword] =
    useState(false)

  const [submitError, setSubmitError] =
    useState("")

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
            <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--action)] font-mono text-[13px] font-medium text-[var(--action-text)]">
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
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border-strong)]">
                    <Check
                      size={11}
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