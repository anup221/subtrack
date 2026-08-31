import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAppStore } from "@/store/appStore"

export default function OAuthCompletePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setAdminSession = useAppStore((s) => s.setAdminSession)
  const setSession = useAppStore((s) => s.setSession)

  useEffect(() => {
    const token = params.get("token")
    if (token && params.get("type") === "admin") {
      setAdminSession(token, "")
      navigate("/admin")
    } else if (token) {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
      setSession({
        token,
        email: payload.sub ?? "",
        role: payload.role ?? "OWNER",
        organizationId: payload.organizationId ?? null,
      })
      navigate("/dashboard")
    } else {
      navigate("/login")
    }
  }, [params, navigate, setAdminSession, setSession])

  return <p className="text-[var(--text-muted)] p-10">Signing you in...</p>
}
