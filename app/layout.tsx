import type { Metadata } from 'next'
import { Geist, Geist_Mono, Oswald, Roboto_Condensed } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import Script from 'next/script'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", weight: ["400", "500", "600", "700"] })
const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], variable: "--font-roboto-condensed", weight: ["400", "500", "600", "700"] })
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() || null

export const metadata: Metadata = {
  metadataBase: new URL('https://omniweb.ai'),
  title: {
    default: 'Omniweb AI — AI-Powered Voice & Chat Agents for Every Business',
    template: '%s | Omniweb AI',
  },
  description: 'Omniweb builds AI-powered voice and chat agents that answer calls, qualify leads, and book appointments 24/7. Built for contractors, professionals, and e-commerce brands.',
  keywords: ['AI voice agent', 'AI chatbot', 'lead qualification', 'appointment booking', 'AI receptionist', 'business automation', 'Omniweb'],
  authors: [{ name: 'Omniweb AI' }],
  creator: 'Omniweb AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://omniweb.ai',
    siteName: 'Omniweb AI',
    title: 'Omniweb AI — AI-Powered Voice & Chat Agents for Every Business',
    description: 'AI voice and chat agents that answer calls, qualify leads, and book appointments 24/7. Set up in minutes.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Omniweb AI Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omniweb AI — AI Voice & Chat Agents',
    description: 'AI agents that answer calls, qualify leads, and book appointments 24/7.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload hero poster for instant first paint */}
        <link
          rel="preload"
          href="/media/posters/ai-conversion-pitch-web.jpg"
          as="image"
          fetchPriority="high"
        />
        {/* Preload hero video so playback starts fast */}
        <link
          rel="preload"
          href="/media/ai-conversion-pitch-web.mp4"
          as="video"
          type="video/mp4"
        />
        {GTM_ID ? (
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        ) : null}
      </head>
      <body className={`${geist.variable} ${geistMono.variable} ${oswald.variable} ${robotoCondensed.variable} font-sans antialiased`}>
        {GTM_ID ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        ) : null}
        <ThemeProvider attribute="data-theme" defaultTheme="default" enableSystem={false} themes={["default", "light", "dark"]}>
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
            <Script
              id="omniweb-widget"
              src="https://omniweb-engine-rs6fr.ondigitalocean.app/widget.js"
              data-tenant-id="dlPBhYBUzIpAeeA8FImeGXYz"
              strategy="afterInteractive"
            />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
