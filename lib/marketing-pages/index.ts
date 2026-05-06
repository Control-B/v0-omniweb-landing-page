import { navItems, allMarketingRoutes as navDerivedRoutes } from "@/lib/site-navigation"
import { featurePages } from "@/lib/marketing-pages/features"
import { solutionPages } from "@/lib/marketing-pages/solutions"
import { resourcePages } from "@/lib/marketing-pages/resources"
import { pricingPages } from "@/lib/marketing-pages/pricing"
import { companyPages } from "@/lib/marketing-pages/company"
import type { PageEntry } from "@/lib/marketing-page-data"

export type MarketingSection = "features" | "solutions" | "resources" | "pricing" | "company"

export const marketingPageRegistry: Record<MarketingSection, Record<string, PageEntry>> = {
  features: featurePages,
  solutions: solutionPages,
  resources: resourcePages,
  pricing: pricingPages,
  company: companyPages,
}

const marketingPageAliases: Partial<Record<MarketingSection, Record<string, string>>> = {
  features: {
    "ai-chat-agents": "ai-chat-assistants",
    "ai-sales-assistant": "lead-automation",
    "ai-customer-support": "ai-chat-assistants",
    "ai-lead-qualification": "lead-automation",
    "ai-appointment-scheduling": "appointment-scheduling",
    "ai-telephony": "workflow-automation",
  },
  solutions: {
    "shopify-ai": "shopify-ai-assistant",
    "e-commerce-ai": "ecommerce",
    "contractor-ai": "contractors",
    "real-estate-ai": "real-estate",
    "healthcare-ai": "healthcare",
    "roadside-assistance-ai": "roadside-assistance",
    "automotive-ai": "roadside-assistance",
    "logistics-ai": "roadside-assistance",
  },
  resources: {
    documentation: "docs",
    "setup-guide": "guides",
    integrations: "integrations",
    api: "api",
    security: "security",
  },
  company: {
    "partner-program": "partners",
    "affiliate-program": "partners",
  },
}

export function getMarketingPage(section: MarketingSection, slug: string) {
  const canonicalSlug = marketingPageAliases[section]?.[slug] ?? slug
  return marketingPageRegistry[section][canonicalSlug] ?? null
}

export function getMarketingStaticParams(section: MarketingSection) {
  return Array.from(
    new Set([
      ...Object.keys(marketingPageRegistry[section]),
      ...Object.keys(marketingPageAliases[section] ?? {}),
    ]),
  ).map((slug) => ({ slug }))
}

export function getAllMarketingRoutes() {
  const sectionRoutes = Object.entries(marketingPageRegistry).flatMap(([section, pages]) => [
    `/${section}`,
    ...Object.keys(pages).map((slug) => `/${section}/${slug}`),
    ...Object.keys(marketingPageAliases[section as MarketingSection] ?? {}).map((slug) => `/${section}/${slug}`),
  ])

  return Array.from(new Set(["/", "/demo", ...navDerivedRoutes, ...sectionRoutes])).sort()
}

export function getNavItems() {
  return navItems
}
