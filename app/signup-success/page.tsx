import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20">
          <Mail className="h-8 w-8 text-cyan-400" />
        </div>
        
        <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
        <p className="mb-8 text-muted-foreground">
          We sent a confirmation link to your email address. Please click the link to verify your account.
        </p>

        <div className="rounded-2xl border border-white/10 bg-card/50 p-6">
          <p className="mb-4 text-sm text-muted-foreground">
            Did not receive the email? Check your spam folder or
          </p>
          <Button variant="outline" className="w-full border-white/10">
            Resend confirmation email
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          <Link href="/signin" className="text-cyan-400 hover:text-cyan-300">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
