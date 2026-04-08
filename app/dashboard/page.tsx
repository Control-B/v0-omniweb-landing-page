import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PageLayout } from "@/components/page-layout"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function DashboardPage() {
  const supabase = await createClient()

  if (!supabase) {
    redirect("/signin")
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  const firstName = user.user_metadata?.first_name || "there"

  return (
    <PageLayout>
      <section className="px-4 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <DashboardLayout firstName={firstName} email={user.email || ""} />
        </div>
      </section>
    </PageLayout>
  )
}
