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