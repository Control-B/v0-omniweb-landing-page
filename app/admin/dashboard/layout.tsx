import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/engine"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/admin")
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return <>{children}</>
}
