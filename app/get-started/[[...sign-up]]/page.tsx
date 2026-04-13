import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function GetStartedPage() {
  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-[#050a12] text-white">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.28] kling-grid-overlay" />

      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center">
          <Link href="/" className="mb-8 inline-block text-2xl font-bold text-white">
            Omniweb
          </Link>
          <SignUp
            afterSignUpUrl="/dashboard"
            signInUrl="/signin"
            appearance={{
              elements: {
                rootBox: 'w-full max-w-md',
                card: 'bg-transparent shadow-none',
                headerTitle: 'text-white',
                headerSubtitle: 'text-gray-400',
                socialButtonsBlockButton: 'border-white/10 bg-white/5 text-white hover:bg-white/10',
                formFieldInput: 'bg-[#111b2e] border-white/10 text-white',
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                footerActionLink: 'text-cyan-400 hover:text-cyan-300',
                identityPreview: 'bg-[#111b2e] border-white/10',
                formFieldLabel: 'text-gray-300',
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
