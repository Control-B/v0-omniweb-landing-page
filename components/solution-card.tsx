import Link from "next/link"
import { ArrowRight, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type SolutionCardProps = {
  icon: LucideIcon
  title: string
  problem: string
  workflow: string
  outcome: string
  href?: string
}

export function SolutionCard({ icon: Icon, title, problem, workflow, outcome, href = "/get-started" }: SolutionCardProps) {
  return (
    <div className="rounded-[1.75rem] border border-white/15 bg-[linear-gradient(180deg,rgba(8,15,31,0.94),rgba(7,12,25,0.88))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/35 bg-violet-400/15 text-violet-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-2xl font-semibold text-white">{title}</h3>
      <div className="mt-5 space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">Problem</p>
          <p className="mt-2 text-sm leading-7 text-slate-200/90">{problem}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">AI Workflow</p>
          <p className="mt-2 text-sm leading-7 text-slate-200/90">{workflow}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">Expected Outcome</p>
          <p className="mt-2 text-sm leading-7 text-slate-100/90">{outcome}</p>
        </div>
      </div>
      <Button asChild className="mt-6 rounded-full bg-white text-slate-950 hover:bg-slate-100">
        <Link href={href}>
          Deploy AI for this business
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}
