import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { PricingPageContent } from "@/components/saas/pricing-page-content"
import { getCurrentUserTenantStatus } from "@/lib/saas/status"

export default async function PricingPage() {
  const status = await getCurrentUserTenantStatus()

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_52%,#f8fbff_100%)] text-slate-900">
      <Header />

      <main className="pt-20">
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
