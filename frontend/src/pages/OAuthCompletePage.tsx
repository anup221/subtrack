import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAppStore } from "@/store/appStore"

export default function OAuthCompletePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setAdminSession = useAppStore((s) => s.setAdminSession)

  useEffect(() => {
    const token = params.get("token")
    if (token) {
      // In a real build, decode the JWT to tell org vs admin apart, or check which page
      // initiated the redirect. Simplest for now: store it and let the next page's data
      // fetch determine which dashboard to route to based on what the token can access.
      setAdminSession(token, "")
      navigate("/admin")
    } else {
      navigate("/login")
    }
  }, [params])

  return <p className="text-[var(--text-muted)] p-10">Signing you in...</p>
}