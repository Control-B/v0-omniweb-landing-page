import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { PricingPageContent } from "@/components/saas/pricing-page-content"
import { getCurrentUserTenantStatus } from "@/lib/saas/status"

export default async function PricingPage() {
  const status = await getCurrentUserTenantStatus()

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#050a12] text-white">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.24] kling-grid-overlay" />
      <Header />

      <main className="relative flex-1 pt-16">
        <PricingPageContent
          isSignedIn={status.isSignedIn}
          onboardingCompleted={status.onboardingCompleted}
          currentPlan={status.plan}
          subscriptionStatus={status.subscriptionStatus}
          initialIndustry={status.industry}
        />
      </main>

      <Footer />
    </div>
  )
}
