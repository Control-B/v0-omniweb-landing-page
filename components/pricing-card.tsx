import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

type PricingCardProps = {
  name: string
  price: string
  outcome: string
  aiMinutes: string
  agents: string
  onboarding: string
  bullets: string[]
  href: string
  cta: string
  highlighted?: boolean
}

export function PricingCard({ name, price, outcome, aiMinutes, agents, onboarding, bullets, href, cta, highlighted = false }: PricingCardProps) {
  return (
    <div className={[
      "relative rounded-[1.85rem] border p-7 shadow-[0_24px_80px_rgba(0,0,0,0.24)]",
      highlighted
        ? "border-cyan-400/40 bg-[linear-gradient(180deg,rgba(17,47,88,0.96),rgba(8,14,28,0.94))]"
        : "border-white/10 bg-[linear-gradient(180deg,rgba(10,18,36,0.94),rgba(6,11,24,0.88))]",
    ].join(" ")}>
      {highlighted ? (
        <div className="absolute -top-3 left-6 rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Most popular
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/80">{name}</p>
          <h3 className="mt-3 text-4xl font-semibold text-white">{price}</h3>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">AI minutes</p>
          <p className="mt-1 text-lg font-semibold text-white">{aiMinutes}</p>
        </div>
      </div>
      <p className="mt-5 text-base leading-7 text-slate-200/90">{outcome}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300/80">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Agents</p>
          <p className="mt-1 font-medium text-white">{agents}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Onboarding</p>
          <p className="mt-1 font-medium text-white">{onboarding}</p>
        </div>
      </div>
      <ul className="mt-6 space-y-3 text-sm text-slate-300/80">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-3">
            <Check className="mt-0.5 h-4.5 w-4.5 text-cyan-300" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <Button asChild className="mt-7 w-full rounded-full bg-white text-slate-950 hover:bg-slate-100">
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  )
}
