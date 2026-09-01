import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { Button } from "@/components/ui/button"

/*
 * Decode a JWT payload without relying on a base64 library.
 *
 * JWT payloads are base64url-encoded (no padding). atob() is
 * sensitive to missing padding, so we restore it before decoding.
 */
function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1]

    if (!part) return null

    const base64 = part
      .replace(/-/g, "+")
      .replace(/_/g, "/")

    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    )

    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((char) =>
          "%" +
          ("00" + char.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    )

    return JSON.parse(json)
  } catch {
    return null
  }
}

export default function OAuthCompletePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setAdminSession = useAppStore((s) => s.setAdminSession)
  const setSession = useAppStore((s) => s.setSession)

  /*
   * Any sign-in error is computed during the first render so we
   * never need to setState synchronously inside the effect below.
   */
  const [error] = useState<string | null>(() => {
    const oauthError = params.get("error")
    const token = params.get("token")

    if (oauthError) {
      return oauthError === "true"
        ? "Google sign-in could not be completed. Please try again."
        : oauthError
    }

    if (!token) {
      return "Sign-in response was incomplete. Please try again."
    }

    return null
  })

  useEffect(() => {
    if (error) {
      return
    }

    const token = params.get("token")
    const type = params.get("type")

    if (!token) {
      return
    }

    if (type === "admin") {
      setAdminSession(token, "")
      navigate("/admin", { replace: true })
      return
    }

    const payload = decodePayload(token)

    if (!payload) {
      // If we cannot read the token payload, the token itself is still
      // valid — pass it straight to session state with a default role.
      setSession({
        token,
        email: "",
        role: "OWNER",
        organizationId: null,
      })
      window.setTimeout(() => navigate("/dashboard", { replace: true }), 0)
      return
    }

    setSession({
      token,
      email: (payload.sub as string) ?? "",
      role: (payload.role as string) ?? "OWNER",
      organizationId: (payload.organizationId as string) ?? null,
    })

    navigate("/dashboard", { replace: true })
  }, [params, navigate, setAdminSession, setSession, error])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--st-bg)] px-6 text-[var(--st-text)]">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--st-border)] bg-[var(--st-surface)] p-8 text-center shadow-[inset_0_1px_0_var(--edge),var(--st-shadow-md)]">
          <div className="st-logo-mark mx-auto mb-6 h-12 w-12 rounded-xl">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="st-logo-glyph">
              <path
                d="M12 3l7 3v6c0 4.2-2.8 7.6-7 9-4.2-1.4-7-4.8-7-9V6l7-3z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)]">
            <AlertTriangle size={20} className="text-[var(--danger)]" />
          </div>

          <h1 className="text-lg font-semibold tracking-[-0.02em]">
            Sign-in issue
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--st-text-muted)]">
            {error}
          </p>

          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() =>
              navigate(params.get("type") === "admin" ? "/admin/login" : "/login")
            }
          >
            Back to sign in
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--st-bg)] px-6 text-[var(--st-text)]">
      <Loader2 size={24} className="animate-spin text-[var(--st-action)]" />
      <p className="text-sm text-[var(--st-text-muted)]">
        Signing you in...
      </p>
    </div>
  )
}