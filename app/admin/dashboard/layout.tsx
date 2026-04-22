import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/engine"

function isInternalRole(role: string | null | undefined) {
  return role === "owner" || role === "admin" || role === "support"
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/admin")
  }

  if (!isInternalRole(session.user.role)) {
    redirect("/dashboard")
  }

  return <>{children}</>
}
