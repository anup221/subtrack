import axios from "axios"
import { useAppStore } from "@/store/appStore"

export const api = axios.create({
  baseURL: "http://localhost:8080",
})

api.interceptors.request.use((config) => {
  const token = useAppStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type AuthApiResponse = {
  token: string
  email: string
  role: string
  organizationId: string
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

export type Plan = {
  id: string
  name: string
  priceCents: number
  maxUsage: number
  features: string[]
}

export type Subscription = {
  id: string
  organizationId: string
  plan: Plan
  status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED"
  currentPeriodStart: string
  currentPeriodEnd: string
}

export async function getPlans(): Promise<Plan[]> {
  const { data } = await api.get<Plan[]>("/api/plans")
  return data
}

export async function getCurrentSubscription(): Promise<Subscription> {
  const { data } = await api.get<Subscription>("/api/subscriptions/me")
  return data
}

export async function changePlan(planId: string): Promise<Subscription> {
  const { data } = await api.post<Subscription>("/api/subscriptions/change-plan", { planId })
  return data
}

export async function cancelSubscription(): Promise<Subscription> {
  const { data } = await api.post<Subscription>("/api/subscriptions/cancel")
  return data
}

export type DailyUsagePoint = {
  date: string
  usage: number
}

export type UsageSummary = {
  currentPeriodUsage: number
  maxUsage: number
  dailyBreakdown: DailyUsagePoint[]
}

export async function recordUsage(quantity: number): Promise<UsageSummary> {
  const { data } = await api.post<UsageSummary>("/api/usage/record", { quantity })
  return data
}

export async function getUsageSummary(): Promise<UsageSummary> {
  const { data } = await api.get<UsageSummary>("/api/usage/summary")
  return data
}