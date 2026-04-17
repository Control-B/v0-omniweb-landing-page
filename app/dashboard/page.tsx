import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getSession, getEngineToken } from "@/lib/auth/engine"
import { DashboardShell } from "@/components/dashboard-shell"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/signin")
  }

  // Admins go to the admin dashboard
  if (session.user.role === "admin") {
    redirect("/admin")
  }

  // Get the real first name from Clerk profile (Google sign-in populates this)
  const clerkUser = await currentUser()
  const rawName = clerkUser?.firstName
    || clerkUser?.username
    || session.user.email.split("@")[0]
    || "there"
  // Title-case the name (Clerk sometimes returns ALL CAPS from Google)
  const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()
  const engineToken = await getEngineToken()

  return (
    <DashboardShell
      email={session.user.email}
      plan={session.user.plan}
      clientId={session.user.client_id}
      firstName={firstName}
      engineToken={engineToken ?? undefined}
    />
  )
}
