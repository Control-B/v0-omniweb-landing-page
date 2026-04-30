import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getSession, getEngineToken } from "@/lib/auth/engine"
import { OmniwebDashboardShell } from "@/components/omniweb-dashboard-shell"

function isInternalRole(role: string | null | undefined) {
  return role === "owner" || role === "admin" || role === "support"
}

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/signin")
  }

  // Internal staff should never land on the client dashboard.
  if (isInternalRole(session.user.role)) {
    redirect("/")
  }

  const clerkUser = await currentUser()
  const rawName = clerkUser?.firstName
    || clerkUser?.username
    || session.user.email.split("@")[0]
    || "there"
  const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()
  const engineToken = await getEngineToken()

  return (
    <OmniwebDashboardShell
      email={session.user.email}
      plan={session.user.plan}
      clientId={session.user.client_id}
      firstName={firstName}
      engineToken={engineToken ?? undefined}
    />
  )
}
