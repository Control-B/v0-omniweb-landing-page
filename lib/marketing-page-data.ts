import { navItems } from "@/lib/site-navigation"
import type { MarketingPageContent } from "@/components/marketing/marketing-page-template"

export type PageAction = { label: string; href: string }

export type PageSeed = {
  slug: string
  title: string
  summary: string
  overview?: string[]
  problem: string
  solution: string
  valueToIndustry: string
  valueToUser: string
  outcome: string
  features: string[]
  useCases: string[]
  howItWorks: string[]
  related: string[]
  faq?: Array<{ question: string; answer: string }>
}

export type PageEntry = {
  metaTitle: string
  metaDescription: string
  content: MarketingPageContent
}

const defaultStats = [
  { value: "24/7", label: "Coverage" },
  { value: "< 2s", label: "Response" },
  { value: "1", label: "System" },
  { value: "0", label: "Missed handoffs" },
]

export function findNavLabel(href: string) {
  for (const item of navItems) {
    if (item.href === href) return item.label
    const match = item.items.find((subItem) => subItem.href === href)
    if (match) return match.label
  }
  return href
}

export function makeRelatedLinks(paths: string[]) {
  return paths.map((href) => ({
    href,
    label: findNavLabel(href),
    description: `Explore ${findNavLabel(href)} as part of the Omniweb revenue system.`,
  }))
}

export function buildPageEntry({
  sectionLabel,
  primaryAction,
  secondaryAction,
  footerEyebrow,
  footerTitle,
  footerDescription,
  seed,
  stats,
}: {
  sectionLabel: string
  primaryAction: PageAction
  secondaryAction?: PageAction
  footerEyebrow: string
  footerTitle: string
  footerDescription: string
  seed: PageSeed
  stats?: Array<{ value: string; label: string }>
}): PageEntry {
  return {
    metaTitle: `${seed.title} | Omniweb AI`,
    metaDescription: seed.summary,
    content: {
      overview: seed.overview,
      hero: {
        eyebrow: sectionLabel,
        title: seed.title,
        description: seed.summary,
        primaryAction,
        secondaryAction,
        stats: stats ?? defaultStats,
      },
      problem: {
        title: "The Problem",
        description: seed.problem,
      },
      solution: {
        title: "The Omniweb Solution",
        description: seed.solution,
      },
      valueToIndustry: seed.valueToIndustry,
      valueToUser: seed.valueToUser,
      outcome: seed.outcome,
      features: seed.features,
      useCases: seed.useCases,
      howItWorks: seed.howItWorks,
      relatedLinks: makeRelatedLinks(seed.related),
      faq: seed.faq,
      footerCta: {
        eyebrow: footerEyebrow,
        title: footerTitle,
        description: footerDescription,
        primaryAction,
        secondaryAction,
      },
    },
  }
}
