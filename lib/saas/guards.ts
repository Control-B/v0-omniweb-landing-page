import "server-only"

import { redirect } from "next/navigation"
import { getCurrentUserTenantStatus } from "@/lib/saas/status"

export async function requireSignedInUser() {
  const status = await getCurrentUserTenantStatus()

  if (!status.isSignedIn) {
    redirect("/signin")
  }

  return status
}

export async function requireOnboardingPageAccess() {
  const status = await requireSignedInUser()

  if (!status.shouldRedirectToOnboarding) {
    if (status.shouldRedirectToPricing) {
      redirect("/trial-expired")
    }

    redirect("/dashboard")
  }

  return status
}

export async function requireDashboardAccess(options?: { allowExpiredPricing?: boolean }) {
  const status = await requireSignedInUser()

  if (status.shouldRedirectToOnboarding) {
    redirect("/onboarding")
  }

  if (status.shouldRedirectToPricing && !options?.allowExpiredPricing) {
    redirect("/trial-expired")
  }

  return status
}

export async function requireTrialExpiredAccess() {
  const status = await requireSignedInUser()

  if (status.shouldRedirectToOnboarding) {
    redirect("/onboarding")
  }

  if (!status.shouldRedirectToPricing) {
    redirect("/dashboard")
  }

  return status
}
