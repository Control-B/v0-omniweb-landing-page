import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/engine"
import { PageLayout } from "@/components/page-layout"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/signin")
  }

  // Extract a display name from the email (everything before @)
  const firstName = session.user.email.split("@")[0] || "there"

  return (
    <PageLayout>
      <section className="px-4 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <DashboardLayout firstName={firstName} email={session.user.email} />
        </div>
      </section>
    </PageLayout>
  )
}
