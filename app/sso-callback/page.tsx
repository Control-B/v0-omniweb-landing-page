"use client"

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#050a12]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        <p className="text-sm text-slate-400">Completing sign in...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  )
}
