import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { CTASection, FAQAccordion, StatStrip } from "@/components/marketing/page-sections"

type CTA = { label: string; href: string }

export type MarketingPageContent = {
  hero: {
    eyebrow: string
    title: string
    description: string
    primaryAction: CTA
    secondaryAction?: CTA
    stats?: Array<{ value: string; label: string }>
  }
  problem: { title: string; description: string }
  solution: { title: string; description: string }
  valueToIndustry: string
  valueToUser: string
  outcome: string
  features: string[]
  useCases: string[]
  howItWorks: string[]
  relatedLinks: Array<{ label: string; href: string; description: string }>
  faq?: Array<{ question: string; answer: string }>
  footerCta: {
    eyebrow: string
    title: string
    description: string
    primaryAction: CTA
    secondaryAction?: CTA
  }
}

type TemplateProps = {
  sectionLabel: string
  content: MarketingPageContent
  accentClassName?: string
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-base leading-7 text-white/75">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function ContentSection({
  title,
  description,
  items,
  accentClassName,
}: {
  title: string
  description?: string
  items?: string[]
  accentClassName: string
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white sm:text-2xl">{title}</h2>
      {description ? <p className="text-base leading-8 text-white/75">{description}</p> : null}
      {items?.length ? <BulletList items={items} /> : null}
      <div className={`h-px w-24 bg-current opacity-30 ${accentClassName}`} />
    </section>
  )
}

function RelatedLinks({
  links,
  accentClassName,
}: {
  links: MarketingPageContent["relatedLinks"]
  accentClassName: string
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-2xl border border-white/8 bg-black/20 p-5 transition hover:border-white/15 hover:bg-white/[0.04]"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">{link.label}</h3>
            <ArrowRight className={`h-4 w-4 ${accentClassName}`} />
          </div>
          <p className="mt-3 text-sm leading-7 text-white/60">{link.description}</p>
        </Link>
      ))}
    </div>
  )
}

function MarketingPageShell({ sectionLabel, content, accentClassName = "text-cyan-300" }: TemplateProps) {
  return (
    <PageLayout>
      <main className="border-b border-white/10">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8 lg:p-12">
            <p className="site-eyebrow mb-4">{sectionLabel}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{content.hero.title}</h1>
            <p className="mt-4 text-base leading-8 text-white/75">{content.hero.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-500">
                <Link href={content.hero.primaryAction.href}>{content.hero.primaryAction.label}</Link>
              </Button>
              {content.hero.secondaryAction ? (
                <Button asChild variant="outline" className="h-11 rounded-full border-white/15 bg-white/5 px-5 text-sm text-white hover:bg-white/10">
                  <Link href={content.hero.secondaryAction.href}>{content.hero.secondaryAction.label}</Link>
                </Button>
              ) : null}
            </div>

            {content.hero.stats?.length ? (
              <div className="mt-10">
                <StatStrip items={content.hero.stats} />
              </div>
            ) : null}

            <div className="mt-10 space-y-10">
              <ContentSection title={content.problem.title} description={content.problem.description} accentClassName={accentClassName} />
              <ContentSection title={content.solution.title} description={content.solution.description} accentClassName={accentClassName} />
              <ContentSection title="Value to the Industry" description={content.valueToIndustry} accentClassName={accentClassName} />
              <ContentSection title="Value to the User" description={content.valueToUser} accentClassName={accentClassName} />
              <ContentSection title="Outcome / Pain Solved" description={content.outcome} accentClassName={accentClassName} />
              <ContentSection title="Key Features" items={content.features} accentClassName={accentClassName} />
              <ContentSection title="Use Cases" items={content.useCases} accentClassName={accentClassName} />
              <ContentSection title="How It Works" items={content.howItWorks} accentClassName={accentClassName} />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white sm:text-2xl">Related Pages</h2>
                <RelatedLinks links={content.relatedLinks} accentClassName={accentClassName} />
              </section>

              {content.faq?.length ? (
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold text-white sm:text-2xl">Frequently Asked Questions</h2>
                  <FAQAccordion items={content.faq} />
                </section>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <CTASection
        eyebrow={content.footerCta.eyebrow}
        title={content.footerCta.title}
        description={content.footerCta.description}
        primaryAction={content.footerCta.primaryAction}
        secondaryAction={content.footerCta.secondaryAction}
      />
    </PageLayout>
  )
}

export function FeaturePageTemplate(props: { content: MarketingPageContent }) {
  return <MarketingPageShell sectionLabel="FEATURES" accentClassName="text-cyan-300" {...props} />
}

export function SolutionPageTemplate(props: { content: MarketingPageContent }) {
  return <MarketingPageShell sectionLabel="SOLUTIONS" accentClassName="text-violet-300" {...props} />
}

export function ResourcePageTemplate(props: { content: MarketingPageContent }) {
  return <MarketingPageShell sectionLabel="RESOURCES" accentClassName="text-emerald-300" {...props} />
}

export function PricingPageTemplate(props: { content: MarketingPageContent }) {
  return <MarketingPageShell sectionLabel="PRICING" accentClassName="text-amber-300" {...props} />
}

export function CompanyPageTemplate(props: { content: MarketingPageContent }) {
  return <MarketingPageShell sectionLabel="COMPANY" accentClassName="text-sky-300" {...props} />
}
