import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
    <div className="min-h-dvh px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {firstName}!</h1>
            <p className="text-muted-foreground">Manage your AI-powered websites</p>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" className="border-white/10">
              Sign out
            </Button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-card/50 p-6">
            <h3 className="mb-2 font-semibold">Create New Website</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Start building your AI-powered website from scratch or a template.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card/50 p-6">
            <h3 className="mb-2 font-semibold">Browse Templates</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Choose from our library of conversion-optimized templates.
            </p>
            <Button variant="outline" className="w-full border-white/10" asChild>
              <Link href="/templates">View Templates</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card/50 p-6">
            <h3 className="mb-2 font-semibold">Documentation</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Learn how to make the most of Omniweb's features.
            </p>
            <Button variant="outline" className="w-full border-white/10" asChild>
              <Link href="/resources">Read Docs</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-card/50 p-6">
          <h3 className="mb-4 font-semibold">Your Websites</h3>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p>You have not created any websites yet.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
