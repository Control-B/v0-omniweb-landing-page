"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTopOnNavigation() {
  const pathname = usePathname()

  useEffect(() => {
    // Disable browser's automatic scroll restoration to avoid landing in the center of the page
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
  }, [])

  useEffect(() => {
    // Whenever pathname changes, force instant scroll to top of the page
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [pathname])

  return null
}
