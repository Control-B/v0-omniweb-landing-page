import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"
import { OmniwebLogo } from "@/components/brand-logo"

export default function SignUpSuccessPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-x-hidden bg-[#050a12] px-4 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.24] kling-grid-overlay" />

      <div className="relative z-10 w-full max-w-md text-center">
        <OmniwebLogo className="mb-8 justify-center" textClassName="text-2xl font-bold tracking-tight text-cyan-200" />

        <div className="rounded-[2.5rem] border border-white/10 bg-[#08101e]/90 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
            <Mail className="h-8 w-8 text-cyan-400" />
          </div>

          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Verify Your Email</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            We sent a secure activation link to your email address. Please click the link to confirm your account and activate your AI contact center.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              asChild
              className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-purple-500"
            >
              <Link href="/signin">
                Go to Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-12 w-full rounded-xl border-white/15 bg-white/5 text-xs font-semibold text-white hover:bg-white/10"
            >
              <Link href="/dashboard">
                Continue to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Need help? Contact <a href="mailto:support@omniweb.ai" className="text-cyan-400 hover:text-cyan-300">support@omniweb.ai</a>
        </p>
      </div>
    </div>
  )
}
