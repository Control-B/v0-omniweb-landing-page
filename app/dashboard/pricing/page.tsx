import { redirect } from "next/navigation"

export default function DashboardPricingRedirectPage() {
  redirect("/dashboard/billing")
}
