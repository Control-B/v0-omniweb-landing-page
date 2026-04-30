import { currentUser } from "@clerk/nextjs/server"
import { OnboardingForm } from "@/components/saas/onboarding-form"
import { requireOnboardingPageAccess } from "@/lib/saas/guards"

export default async function OnboardingPage() {
  await requireOnboardingPageAccess()
  const user = await currentUser()
  const metadata = (user?.unsafeMetadata ?? {}) as Record<string, unknown>
  const initialBusinessName = typeof metadata.companyName === "string" ? metadata.companyName : ""

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#050a12] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.18),transparent_35%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.16),transparent_35%)]" />
      <div className="relative mx-auto flex min-h-dvh max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Onboarding</p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">Create your Omniweb AI workspace.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/70">Tell us a little about your business so we can start your 7-day free trial, provision your workspace, and prepare the default AI agent for your website.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["1", "Business profile"],
                ["2", "Workspace created"],
                ["3", "Trial starts"],
              ].map(([step, label]) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
                  <p className="text-sm font-semibold text-cyan-200">Step {step}</p>
                  <p className="mt-2 text-sm text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
            <h2 className="text-2xl font-semibold text-white">Business details</h2>
            <p className="mt-2 text-sm text-white/60">We’ll use this to personalize your dashboard and website widget.</p>
            <div className="mt-6">
              <OnboardingForm initialBusinessName={initialBusinessName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
