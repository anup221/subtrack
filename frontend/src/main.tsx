/* eslint-disable react-refresh/only-export-components */

import { StrictMode, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import "./index.css"

import { router } from "./router"
import { useThemeStore } from "./store/themeStore"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /*
       * Keep fetched data fresh briefly so navigating between
       * dashboard views reuses cached data instead of refetching
       * on every mount (which caused loading flashes / lag in the
       * sidebar). Window focus and page actions still refetch.
       */
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
    },
  },
})

function ThemedApp() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    )
  }, [theme])

  return <RouterProvider router={router} />
}

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("SubTrack: #root element was not found")
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemedApp />
    </QueryClientProvider>
  </StrictMode>
)