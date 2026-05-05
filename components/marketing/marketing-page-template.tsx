import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { CTASection, FAQAccordion, SectionHeading, StatStrip } from "@/components/marketing/page-sections"

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

function SmartCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="kling-panel rounded-[1.6rem] p-6">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/60">{description}</p>
    </div>
  )
}

function BulletCard({ text }: { text: string }) {
  return (
    <div className="kling-panel rounded-[1.5rem] p-5">
      <div className="flex items-start gap-3">
        <span className="site-icon-chip mt-0.5 inline-flex h-6 w-6 rounded-full">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm leading-7 text-white/70">{text}</p>
      </div>
    </div>
  )
}

function MarketingPageShell({ sectionLabel, content, accentClassName = "text-cyan-300" }: TemplateProps) {
  return (
    <PageLayout>
      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.32em] text-cyan-400">{sectionLabel}</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {content.hero.title}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/60 sm:text-lg">
              {content.hero.description}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild className="h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-6 text-white hover:from-cyan-400 hover:to-purple-400">
                <Link href={content.hero.primaryAction.href}>{content.hero.primaryAction.label}</Link>
              </Button>
              {content.hero.secondaryAction ? (
                <Button asChild variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10">
                  <Link href={content.hero.secondaryAction.href}>{content.hero.secondaryAction.label}</Link>
                </Button>
              ) : null}
            </div>
          </div>

          {content.hero.stats?.length ? <StatStrip items={content.hero.stats} /> : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="kling-panel rounded-[2rem] p-8">
              <SectionHeading eyebrow="The Problem" title={content.problem.title} align="left" />
              <p className="text-base leading-8 text-white/60">{content.problem.description}</p>
            </div>
            <div className="kling-panel-strong rounded-[2rem] p-8">
              <SectionHeading eyebrow="The Omniweb Solution" title={content.solution.title} align="left" />
              <p className="text-base leading-8 text-white/60">{content.solution.description}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <SmartCard title="Value to the Industry" description={content.valueToIndustry} />
            <SmartCard title="Value to the User" description={content.valueToUser} />
            <SmartCard title="Outcome / Pain Solved" description={content.outcome} />
          </div>

          <div>
            <SectionHeading
              eyebrow="Key Features"
              title="Built to answer, qualify, schedule, and follow up"
              description="Each page routes to the same operating system: AI front-end, workflow automation, and revenue-focused handoff."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {content.features.map((feature) => <BulletCard key={feature} text={feature} />)}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Use Cases"
              title="Where this page fits in a live Omniweb deployment"
              description="These use cases show how the product adapts to real buying journeys and support needs."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {content.useCases.map((useCase) => <BulletCard key={useCase} text={useCase} />)}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="How It Works"
              title="From first touch to qualified follow-up"
              description="Omniweb is more than a widget — it is a full AI revenue system with structured handoff and automation."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {content.howItWorks.map((step, index) => (
                <div key={step} className="kling-panel rounded-[1.6rem] p-6">
                  <div className={`text-sm font-semibold uppercase tracking-[0.24em] ${accentClassName}`}>Step {index + 1}</div>
                  <p className="mt-3 text-base leading-7 text-white/70">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Related Pages"
              title="Keep exploring the connected revenue system"
              description="Every feature and solution page links to the rest of the platform so visitors can move naturally through the site."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {content.relatedLinks.map((link) => (
                <Link key={link.href} href={link.href} className="kling-panel group rounded-[1.5rem] p-6 transition hover:border-cyan-500/20 hover:bg-white/[0.06]">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white transition group-hover:text-cyan-300">{link.label}</h3>
                    <ArrowRight className="h-4 w-4 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/55">{link.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {content.faq?.length ? (
            <div>
              <SectionHeading
                eyebrow="FAQ"
                title="Common questions before you launch"
                description="Use this section to remove friction and explain how Omniweb fits into the buyer's journey."
              />
              <FAQAccordion items={content.faq} />
            </div>
          ) : null}

          <CTASection
            eyebrow={content.footerCta.eyebrow}
            title={content.footerCta.title}
            description={content.footerCta.description}
            primaryAction={content.footerCta.primaryAction}
            secondaryAction={content.footerCta.secondaryAction}
          />
        </div>
      </section>
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
