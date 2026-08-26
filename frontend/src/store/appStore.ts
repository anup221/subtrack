import { create } from "zustand"
import { persist } from "zustand/middleware"

type Session = {
  token: string
  email: string
  role: string
  organizationId: string
}

type AppState = {
  token: string | null
  email: string | null
  role: string | null
  organizationId: string | null
  setSession: (session: Session) => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      role: null,
      organizationId: null,
      setSession: (session) =>
        set({
          token: session.token,
          email: session.email,
          role: session.role,
          organizationId: session.organizationId,
        }),
      logout: () =>
        set({ token: null, email: null, role: null, organizationId: null }),
    }),
    { name: "subtrack-session" }
  )
)