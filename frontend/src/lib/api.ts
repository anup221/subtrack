import axios from "axios"
import { useAppStore } from "@/store/appStore"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
})

api.interceptors.request.use((config) => {
  const token = useAppStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/* ============================================================
   AUTH
============================================================ */

export type AuthApiResponse = {
  token: string
  email: string
  role: string
  organizationId: string | null
}

export async function signup(
  organizationName: string,
  email: string,
  password: string
): Promise<AuthApiResponse> {
  const { data } = await api.post<AuthApiResponse>("/api/auth/signup", {
    organizationName,
    email,
    password,
  })

  return data
}

export async function login(
  email: string,
  password: string
): Promise<AuthApiResponse> {
  const { data } = await api.post<AuthApiResponse>("/api/auth/login", {
    email,
    password,
  })

  return data
}

/* ============================================================
   PLATFORM ADMIN AUTH
============================================================ */

export type AdminAuthApiResponse = {
  token: string
  email: string
  role: string
  organizationId: string | null
}

export async function adminSignup(
  email: string,
  password: string,
  bootstrapCode: string
): Promise<AdminAuthApiResponse> {
  const { data } = await api.post<AdminAuthApiResponse>(
    "/api/admin-auth/signup",
    {
      email,
      password,
      bootstrapCode,
    }
  )

  return data
}

export async function adminLogin(
  email: string,
  password: string
): Promise<AdminAuthApiResponse> {
  const { data } = await api.post<AdminAuthApiResponse>(
    "/api/admin-auth/login",
    {
      email,
      password,
    }
  )

  return data
}

/*
 * Google OAuth URLs.
 *
 * These return the backend OAuth authorization endpoints.
 * The backend then redirects the user to Google.
 */
export function googleOrgLoginUrl(): string {
  return `${api.defaults.baseURL}/oauth2/authorization/google-org`
}

export function googleAdminLoginUrl(): string {
  return `${api.defaults.baseURL}/oauth2/authorization/google-admin`
}

/* ============================================================
   PLANS
============================================================ */

export type Plan = {
  id: string
  name: string
  priceCents: number
  maxUsage: number
  features: string[]
}

export async function getPlans(): Promise<Plan[]> {
  const { data } = await api.get<Plan[]>("/api/plans")

  return data
}

/* ============================================================
   SUBSCRIPTIONS
============================================================ */

export type Subscription = {
  id: string
  organizationId: string
  plan: Plan
  status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED"
  currentPeriodStart: string
  currentPeriodEnd: string
}

export async function getCurrentSubscription(): Promise<Subscription> {
  const { data } = await api.get<Subscription>("/api/subscriptions/me")

  return data
}

export type ChangePlanResponse = {
  subscription: Subscription
  upgradeInvoice: Invoice | null
}

export async function changePlan(
  planId: string
): Promise<ChangePlanResponse> {
  const { data } = await api.post<ChangePlanResponse>(
    "/api/subscriptions/change-plan",
    {
      planId,
    }
  )

  return data
}

export async function cancelSubscription(): Promise<Subscription> {
  const { data } = await api.post<Subscription>(
    "/api/subscriptions/cancel"
  )

  return data
}

/* ============================================================
   USAGE
============================================================ */

export type DailyUsagePoint = {
  date: string
  usage: number
}

export type UsageSummary = {
  currentPeriodUsage: number
  maxUsage: number
  dailyBreakdown: DailyUsagePoint[]
}

export async function recordUsage(
  quantity: number
): Promise<UsageSummary> {
  const { data } = await api.post<UsageSummary>(
    "/api/usage/record",
    {
      quantity,
    }
  )

  return data
}

export async function getUsageSummary(): Promise<UsageSummary> {
  const { data } = await api.get<UsageSummary>(
    "/api/usage/summary"
  )

  return data
}

/* ============================================================
   BILLING / INVOICES
============================================================ */

export type InvoiceLineItem = {
  description: string
  amountCents: number
  quantity: number | null
}

export type Invoice = {
  id: string
  status: "PENDING" | "PAID" | "FAILED"
  periodStart: string
  periodEnd: string
  totalCents: number
  lineItems: InvoiceLineItem[]
}

export async function getInvoices(): Promise<Invoice[]> {
  const { data } = await api.get<Invoice[]>("/api/invoices")

  return data
}

export async function getInvoice(id: string): Promise<Invoice> {
  const { data } = await api.get<Invoice>(
    `/api/invoices/${id}`
  )

  return data
}

export async function generateInvoice(): Promise<Invoice> {
  const { data } = await api.post<Invoice>(
    "/api/invoices/generate"
  )

  return data
}

/* ============================================================
   PAYMENTS
============================================================ */

export type Payment = {
  id: string
  invoiceId: string
  amountCents: number
  status: "PENDING" | "SUCCEEDED" | "FAILED"
  attemptNumber: number
  createdAt: string
}

export async function payInvoice(
  invoiceId: string
): Promise<Payment> {
  const { data } = await api.post<Payment>(
    `/api/payments/pay/${invoiceId}`
  )

  return data
}

export async function getPayments(
  invoiceId: string
): Promise<Payment[]> {
  const { data } = await api.get<Payment[]>(
    `/api/payments/invoice/${invoiceId}`
  )

  return data
}

/* ============================================================
   ADMIN CONSOLE
============================================================ */

export type AdminMetrics = {
  mrrCents: number
  totalOrganizations: number
  activeSubscriptions: number
  churnRatePercent: number
}

export type TenantSummary = {
  organizationId: string
  organizationName: string
  planName: string
  subscriptionStatus: string
  createdAt: string
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const { data } = await api.get<AdminMetrics>(
    "/api/admin/metrics"
  )

  return data
}

export async function getAdminTenants(): Promise<TenantSummary[]> {
  const { data } = await api.get<TenantSummary[]>(
    "/api/admin/tenants"
  )

  return data
}

/* ============================================================
   RAZORPAY
============================================================ */

export type CreateOrderResponse = {
  razorpayOrderId: string
  amountCents: number
  currency: string
  keyId: string
  invoiceId: string
}

export async function createRazorpayOrder(
  invoiceId: string
): Promise<CreateOrderResponse> {
  const { data } = await api.post<CreateOrderResponse>(
    `/api/payments/razorpay/create-order/${invoiceId}`
  )

  return data
}

export async function verifyRazorpayPayment(payload: {
  invoiceId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}): Promise<Payment> {
  const { data } = await api.post<Payment>(
    "/api/payments/razorpay/verify",
    payload
  )

  return data
}

export async function setAdminTenantStatus(organizationId: string, blocked: boolean): Promise<void> {
  await api.post(`/api/admin/tenants/${organizationId}/${blocked ? "block" : "unblock"}`)
}

export async function removeAdminTenant(organizationId: string): Promise<void> {
  await api.delete(`/api/admin/tenants/${organizationId}`)
}
