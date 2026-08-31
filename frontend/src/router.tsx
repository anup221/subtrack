import { createBrowserRouter, Navigate } from "react-router-dom"
import type { ReactNode } from "react"

import App from "@/App"

import LoginPage from "@/pages/LoginPage"
import SignupPage from "@/pages/SignupPage"
import AdminLoginPage from "@/pages/AdminLoginPage"
import OAuthCompletePage from "@/pages/OAuthCompletePage"

import PricingPage from "@/pages/PricingPage"
import DashboardHome from "@/pages/DashboardHome"
import UsagePage from "@/pages/UsagePage"
import BillingPage from "@/pages/BillingPage"
import AdminOverview from "@/pages/AdminOverview"
import AdminTenantDetail from "@/pages/AdminTenantDetail"
import OrganizationPage from "@/pages/OrganizationPage"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useAppStore } from "@/store/appStore"


/* ============================================================
   ORGANIZATION / USER ROUTE
============================================================ */

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAppStore((s) => s.token)
  const isPlatformAdmin = useAppStore((s) => s.isPlatformAdmin)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  /*
   * Platform admins belong to the platform admin console,
   * not an organization dashboard.
   */
  if (isPlatformAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <DashboardLayout>{children}</DashboardLayout>
}


/* ============================================================
   ORGANIZATION OWNER ROUTE
============================================================ */

function OwnerRoute({ children }: { children: ReactNode }) {
  const token = useAppStore((s) => s.token)
  const role = useAppStore((s) => s.role)
  const isPlatformAdmin = useAppStore((s) => s.isPlatformAdmin)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  /*
   * Platform admins use the separate admin console.
   */
  if (isPlatformAdmin) {
    return <Navigate to="/admin" replace />
  }

  /*
   * Only organization owners/admins can access
   * organization management.
   */
  if (role !== "OWNER" && role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />
  }

  return <DashboardLayout>{children}</DashboardLayout>
}


/* ============================================================
   PLATFORM ADMIN ROUTE
============================================================ */

function AdminRoute({ children }: { children: ReactNode }) {
  const token = useAppStore((s) => s.token)
  const isPlatformAdmin = useAppStore((s) => s.isPlatformAdmin)

  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  /*
   * Only a PLATFORM_ADMIN session can access
   * the platform administration area.
   */
  if (!isPlatformAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <DashboardLayout>{children}</DashboardLayout>
}


/* ============================================================
   ROUTER
============================================================ */

export const router = createBrowserRouter([
  /* ==========================================================
     PUBLIC
  ========================================================== */

  {
    path: "/",
    element: <App />,
  },

  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/signup",
    element: <SignupPage />,
  },

  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },

  {
    path: "/oauth-complete",
    element: <OAuthCompletePage />,
  },


  /* ==========================================================
     ORGANIZATION DASHBOARD
  ========================================================== */

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


  /* ==========================================================
     ORGANIZATION OWNER CONSOLE
  ========================================================== */

  {
    path: "/organization",
    element: (
      <OwnerRoute>
        <OrganizationPage />
      </OwnerRoute>
    ),
  },


  /* ==========================================================
     PLATFORM ADMIN
  ========================================================== */

  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminOverview />
      </AdminRoute>
    ),
  },

  {
    path: "/admin/tenants/:organizationId",
    element: (
      <AdminRoute>
        <AdminTenantDetail />
      </AdminRoute>
    ),
  },
])