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
            elements: {
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
