import { createBrowserRouter, Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import App from "@/App"
import LoginPage from "@/pages/LoginPage"
import SignupPage from "@/pages/SignupPage"
import PricingPage from "@/pages/PricingPage"
import DashboardHome from "@/pages/DashboardHome"
import UsagePage from "@/pages/UsagePage"
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
        <DashboardHome />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pricing",
    element: (
      <ProtectedRoute>
        <PricingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/usage",
    element: (
      <ProtectedRoute>
        <UsagePage />
      </ProtectedRoute>
    ),
  },
])