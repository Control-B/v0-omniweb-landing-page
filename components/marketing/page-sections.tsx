import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight, Check, Sparkles } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string
  title: string
  description?: string
  align?: "left" | "center"
}) {
  return (
    <div className={cn("mb-12", align === "center" ? "text-center" : "text-left")}>
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">{title}</h2>
      {description ? (
        <p className={cn("mt-4 max-w-3xl text-base leading-7 text-white/55 sm:text-lg", align === "center" ? "mx-auto" : "")}>{description}</p>
      ) : null}
    </div>
  )
}

export function SolutionCard({
  icon: Icon,
  title,
  problem,
  solution,
  outcome,
}: {
  icon: LucideIcon
  title: string
  problem: string
  solution: string
  outcome: string
}) {
  return (
    <div className="kling-panel rounded-[1.75rem] p-7 transition hover:border-cyan-500/25 hover:bg-white/[0.06]">
      <div className="site-icon-chip mb-6 flex h-12 w-12">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <dl className="mt-6 space-y-5 text-sm leading-7 text-white/60">
        <div>
          <dt className="mb-1 font-semibold uppercase tracking-[0.18em] text-white/35">Problem</dt>
          <dd>{problem}</dd>
        </div>
        <div>
          <dt className="mb-1 font-semibold uppercase tracking-[0.18em] text-white/35">Omniweb Solution</dt>
          <dd>{solution}</dd>
        </div>
        <div>
          <dt className="mb-1 font-semibold uppercase tracking-[0.18em] text-white/35">Outcome</dt>
          <dd className="text-white/80">{outcome}</dd>
        </div>
      </dl>
    </div>
  )
}

export function ResourceCard({
  icon: Icon,
  category,
  title,
  description,
  meta,
}: {
  icon: LucideIcon
  category: string
  title: string
  description: string
  meta: string
}) {
  return (
    <article className="kling-panel group rounded-[1.5rem] p-6 transition hover:border-white/20 hover:bg-white/[0.06]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="site-icon-chip flex h-11 w-11">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/45">{category}</span>
      </div>
      <h3 className="text-lg font-semibold text-white transition group-hover:text-cyan-300">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/55">{description}</p>
      <p className="mt-5 text-xs uppercase tracking-[0.2em] text-white/30">{meta}</p>
    </article>
  )
}

export function PricingCard({
  name,
  audience,
  price,
  description,
  features,
  videoCapability,
  aiCapability,
  supportLevel,
  href,
  isFeatured = false,
}: {
  name: string
  audience: string
  price: string
  description: string
  features: string[]
  videoCapability: string
  aiCapability: string
  supportLevel: string
  href: string
  isFeatured?: boolean
}) {
  return (
    <div className={cn(
      "relative rounded-[1.8rem] border p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)]",
      isFeatured
        ? "kling-panel-strong border-cyan-400/40 bg-gradient-to-b from-cyan-500/14 via-blue-500/10 to-white/[0.03]"
        : "kling-panel border-white/10 bg-white/[0.04]",
    )}>
      {isFeatured ? (
        <div className="absolute -top-3 left-8 rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Recommended
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-white">{name}</h3>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-white/35">{audience}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold text-white">{price}</div>
          <div className="text-sm text-white/35">Outcome-driven packaging</div>
        </div>
      </div>
      <p className="mt-5 text-sm leading-7 text-white/60">{description}</p>
      <div className="mt-6 grid gap-3 text-sm text-white/65">
        <FeatureLine label="Video" value={videoCapability} />
        <FeatureLine label="AI text + voice" value={aiCapability} />
        <FeatureLine label="Support" value={supportLevel} />
      </div>
      <ul className="mt-6 space-y-3 text-sm text-white/65">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="site-icon-chip mt-0.5 inline-flex h-5 w-5 rounded-full">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        className={cn(
          "mt-8 h-12 w-full rounded-full text-sm font-semibold",
          isFeatured
            ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-400 hover:to-purple-400"
            : "bg-white/10 text-white hover:bg-white/15",
        )}
      >
        <Link href={href}>Choose {name}</Link>
      </Button>
    </div>
  )
}

function FeatureLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
      <span className="text-white/35">{label}</span>
      <span className="max-w-[16rem] text-right text-white/75">{value}</span>
    </div>
  )
}

export function ComparisonTable({
  columns,
  rows,
}: {
  columns: string[]
  rows: Array<{ label: string; values: string[] }>
}) {
  return (
    <div className="kling-panel overflow-hidden rounded-[1.75rem]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-white/70">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-white/35">
            <tr>
              <th className="px-6 py-4">Feature</th>
              {columns.map((column) => (
                <th key={column} className="px-6 py-4">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.label} className={cn(index % 2 === 0 ? "bg-transparent" : "bg-black/20", "border-t border-white/8")}>
                <td className="px-6 py-4 font-medium text-white">{row.label}</td>
                {row.values.map((value, valueIndex) => (
                  <td key={`${row.label}-${valueIndex}`} className="px-6 py-4">{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TemplateCard({
  title,
  description,
  businessType,
  previewLabel,
  href,
}: {
  title: string
  description: string
  businessType: string
  previewLabel: string
  href: string
}) {
  return (
    <article className="kling-panel group overflow-hidden rounded-[1.6rem] transition hover:border-white/20 hover:bg-white/[0.06]">
      <div className="relative aspect-[16/11] overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.25),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.3),transparent_35%),linear-gradient(180deg,#0a1220,#050a12)] p-4">
        <div className="h-full rounded-[1.25rem] border border-white/10 bg-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="mt-4 h-24 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-2/3 rounded-full bg-white/10" />
            <div className="h-3 w-1/2 rounded-full bg-white/10" />
            <div className="h-9 w-28 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/60">
          {previewLabel}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/45">{businessType}</span>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/55">{description}</p>
        <div className="mt-6 flex gap-3">
          <Button asChild variant="outline" className="h-11 rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10">
            <Link href={`${href}#preview`}>Preview</Link>
          </Button>
          <Button asChild className="h-11 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-5 text-white hover:from-cyan-400 hover:to-purple-400">
            <Link href={href}>Use This Template</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

export function TestimonialCard({
  quote,
  name,
  role,
  metric,
}: {
  quote: string
  name: string
  role: string
  metric?: string
}) {
  return (
    <div className="kling-panel rounded-[1.6rem] p-7">
      <Sparkles className="site-icon-accent h-5 w-5" />
      <p className="mt-5 text-base leading-8 text-white/75">“{quote}”</p>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <div className="font-semibold text-white">{name}</div>
          <div className="text-sm text-white/40">{role}</div>
        </div>
        {metric ? <div className="text-sm font-medium text-cyan-300">{metric}</div> : null}
      </div>
    </div>
  )
}

export function FAQAccordion({
  items,
}: {
  items: Array<{ question: string; answer: string }>
}) {
  return (
    <Accordion type="single" collapsible className="kling-panel rounded-[1.6rem] px-6">
      {items.map((item, index) => (
        <AccordionItem key={item.question} value={`item-${index}`} className="border-white/10">
          <AccordionTrigger className="py-6 text-base font-medium text-white hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-6 text-sm leading-7 text-white/55">{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export function CTASection({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}: {
  eyebrow: string
  title: string
  description: string
  primaryAction: { label: string; href: string }
  secondaryAction?: { label: string; href: string }
}) {
  return (
    <section className="px-4 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] kling-panel-strong bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(59,130,246,0.1),rgba(168,85,247,0.18))] p-[1px]">
        <div className="rounded-[calc(2rem-1px)] bg-[#07111e]/95 px-8 py-12 text-center sm:px-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">{eyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">{title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/60">{description}</p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild className="h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-6 text-white hover:from-cyan-400 hover:to-purple-400">
              <Link href={primaryAction.href}>{primaryAction.label}</Link>
            </Button>
            {secondaryAction ? (
              <Button asChild variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export function StatStrip({ items }: { items: Array<{ value: string; label: string }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="kling-stat-card rounded-[1.4rem] px-6 py-5">
          <div className="text-3xl font-semibold text-white">{item.value}</div>
          <div className="mt-2 text-sm text-white/45">{item.label}</div>
        </div>
      ))}
    </div>
  )
}
