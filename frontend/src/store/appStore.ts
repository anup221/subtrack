import { create } from "zustand"
import { persist } from "zustand/middleware"

type Session = {
  token: string
  email: string
  role: string
  organizationId: string | null
}

type AppState = {
  token: string | null
  email: string | null
  role: string | null
  organizationId: string | null
  isPlatformAdmin: boolean

  setSession: (session: Session) => void
  setAdminSession: (token: string, email: string) => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      role: null,
      organizationId: null,
      isPlatformAdmin: false,

      // Normal organization / owner / user session
      setSession: (session) =>
        set({
          token: session.token,
          email: session.email,
          role: session.role,
          organizationId: session.organizationId,
          isPlatformAdmin: false,
        }),

      // Platform admin session
      setAdminSession: (token, email) =>
        set({
          token,
          email,
          role: "PLATFORM_ADMIN",
          organizationId: null,
          isPlatformAdmin: true,
        }),

      logout: () =>
        set({
          token: null,
          email: null,
          role: null,
          organizationId: null,
          isPlatformAdmin: false,
        }),
    }),
    {
      name: "subtrack-session",
    }
  )
)