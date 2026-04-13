import type { Metadata } from 'next'
import { Geist, Geist_Mono, Oswald, Roboto_Condensed } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { Analytics } from '@vercel/analytics/next'
import { VoiceOrb } from '@/components/voice-orb'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", weight: ["400", "500", "600", "700"] })
const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], variable: "--font-roboto-condensed", weight: ["400", "500", "600", "700"] })

export const metadata: Metadata = {
  title: 'Omniweb AI',
  description: 'Omniweb builds, hosts, and sells AI-powered website systems and templates for e-commerce brands, contractors, and professionals.',
  icons: {
    icon: [
      { url: '/icon.png?v=20260411d', type: 'image/png', sizes: '48x48' },
      { url: '/icon.svg?v=20260411d', type: 'image/svg+xml', sizes: 'any' },
    ],
    shortcut: '/favicon.ico?v=20260411d',
    apple: '/apple-icon.png?v=20260411d',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} ${oswald.variable} ${robotoCondensed.variable} font-sans antialiased`}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: '#06b6d4',
              colorDanger: '#ef4444',
              colorSuccess: '#22c55e',
              colorWarning: '#f59e0b',
              colorBackground: '#0a1225',
              colorInputBackground: '#0f1a2e',
              colorInputText: '#f1f5f9',
              colorText: '#f1f5f9',
              colorTextSecondary: '#94a3b8',
              colorNeutral: '#cbd5e1',
              borderRadius: '1rem',
              spacingUnit: '4px',
              fontSize: '14px',
            },
            elements: {
              // Root card
              rootBox: 'w-full',
              card: 'bg-[#0a1225]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_25px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(6,182,212,0.08)] rounded-[2rem]',
              // Header
              headerTitle: 'text-xl font-bold bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-300 bg-clip-text text-transparent',
              headerSubtitle: 'text-slate-400 text-sm',
              // Social buttons
              socialButtonsBlockButton: 'border border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-200 rounded-xl h-11',
              socialButtonsBlockButtonText: 'text-sm font-medium',
              socialButtonsProviderIcon: 'w-5 h-5',
              // Divider
              dividerLine: 'bg-white/[0.06]',
              dividerText: 'text-slate-500 text-xs uppercase tracking-wider',
              // Form fields
              formFieldLabel: 'text-slate-300 text-sm font-medium',
              formFieldInput: 'bg-[#0f1a2e] border-white/[0.08] text-white placeholder:text-slate-500 rounded-xl h-11 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all',
              // Primary button
              formButtonPrimary: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-white font-semibold rounded-xl h-12 shadow-[0_4px_20px_rgba(6,182,212,0.3)] hover:shadow-[0_6px_30px_rgba(6,182,212,0.4)] transition-all duration-200 border-0',
              // Footer
              footerActionLink: 'text-cyan-400 hover:text-cyan-300 font-medium transition-colors',
              footerActionText: 'text-slate-400',
              // Identity preview (email shown after entering)
              identityPreviewEditButton: 'text-cyan-400 hover:text-cyan-300',
              identityPreviewText: 'text-slate-300',
              // OTP / verification
              otpCodeFieldInput: 'bg-[#0f1a2e] border-white/[0.08] text-white rounded-xl',
              // Alert / error
              alert: 'bg-red-500/10 border border-red-500/20 rounded-xl text-red-300',
              // User button (navbar avatar)
              userButtonAvatarBox: 'w-8 h-8 ring-2 ring-cyan-500/30',
              userButtonPopoverCard: 'bg-[#0a1225] border border-white/[0.08] shadow-2xl rounded-2xl',
              userButtonPopoverActionButton: 'text-slate-300 hover:bg-white/[0.05] rounded-xl',
              userButtonPopoverFooter: 'hidden',
            },
          }}
          afterSignOutUrl="/"
        >
          {children}
          <VoiceOrb />
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  )
}
