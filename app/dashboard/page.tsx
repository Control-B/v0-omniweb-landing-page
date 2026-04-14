import { redirect } from "next/navigation"
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

  const firstName = session.user.email.split("@")[0] || "there"
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
