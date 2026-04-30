import { redirect } from "next/navigation"
import SignInPage from "@/app/signin/[[...sign-in]]/page"
import { getCurrentUserTenantStatus, getSignedInAppRedirect } from "@/lib/saas/status"

export default async function SignInAliasPage() {
  const status = await getCurrentUserTenantStatus()

  if (status.isSignedIn) {
    redirect(getSignedInAppRedirect(status))
  }

  return <SignInPage />
}
