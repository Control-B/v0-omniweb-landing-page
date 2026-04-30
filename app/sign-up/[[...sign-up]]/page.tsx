import { redirect } from "next/navigation"
import GetStartedPage from "@/app/get-started/[[...sign-up]]/page"
import { getCurrentUserTenantStatus, getSignedInAppRedirect } from "@/lib/saas/status"

export default async function SignUpAliasPage() {
  const status = await getCurrentUserTenantStatus()

  if (status.isSignedIn) {
    redirect(getSignedInAppRedirect(status))
  }

  return <GetStartedPage />
}
