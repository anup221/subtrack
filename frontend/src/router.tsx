import { createBrowserRouter, Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import App from "@/App"
import LoginPage from "@/pages/LoginPage"
import SignupPage from "@/pages/SignupPage"
import PricingPage from "@/pages/PricingPage"
import DashboardHome from "@/pages/DashboardHome"
import UsagePage from "@/pages/UsagePage"
import BillingPage from "@/pages/BillingPage"
import AdminOverview from "@/pages/AdminOverview"
import OrganizationPage from "@/pages/OrganizationPage"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useAppStore } from "@/store/appStore"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAppStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <DashboardLayout>{children}</DashboardLayout>
}

function OwnerRoute({ children }: { children: ReactNode }) {
  const token = useAppStore((s) => s.token)
  const role = useAppStore((s) => s.role)
  if (!token) return <Navigate to="/login" replace />
  if (role !== "OWNER" && role !== "ADMIN") return <Navigate to="/dashboard" replace />
  return <DashboardLayout>{children}</DashboardLayout>
}

function AdminRoute({ children }: { children: ReactNode }) {
  const token = useAppStore((s) => s.token)
  const role = useAppStore((s) => s.role)
  if (!token) return <Navigate to="/login" replace />
  if (role !== "OWNER" && role !== "ADMIN") return <Navigate to="/dashboard" replace />
  return <DashboardLayout>{children}</DashboardLayout>
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
  {
    path: "/billing",
    element: (
      <ProtectedRoute>
        <BillingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/organization",
    element: (
      <OwnerRoute>
        <OrganizationPage />
      </OwnerRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminOverview />
      </AdminRoute>
    ),
  },
])
