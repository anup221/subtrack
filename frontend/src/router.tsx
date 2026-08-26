import { createBrowserRouter, Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import App from "@/App"
import LoginPage from "@/pages/LoginPage"
import SignupPage from "@/pages/SignupPage"
import { useAppStore } from "@/store/appStore"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAppStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <div className="p-8">Dashboard placeholder — Phase 2 builds this out</div>
      </ProtectedRoute>
    ),
  },
])