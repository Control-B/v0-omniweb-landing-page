import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/onboarding(.*)',
  '/dashboard(.*)',
  '/trial-expired(.*)',
  '/api/onboarding(.*)',
  '/api/me(.*)',
  '/api/dashboard(.*)',
  '/api/agent(.*)',
  '/api/analytics(.*)',
  '/api/billing(.*)',
  '/api/follow-ups(.*)',
  '/api/widget(.*)',
])

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''
const hasValidClerk = Boolean(
  publishableKey &&
  !publishableKey.includes('example.com') &&
  publishableKey.startsWith('pk_') &&
  !publishableKey.includes('pk_test_...')
)

export default hasValidClerk
  ? clerkMiddleware(async (auth, request) => {
      if (isProtectedRoute(request)) {
        await auth.protect()
      }
    })
  : () => NextResponse.next()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

