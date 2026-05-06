import { readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const repoRoot = process.cwd()
const appRoot = join(repoRoot, "app")

function walkPages(dir, pages = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) walkPages(full, pages)
    if (stat.isFile() && entry === "page.tsx") pages.push(full)
  }
  return pages
}

function pageToRoute(file) {
  const rel = relative(appRoot, file).replace(/\/page\.tsx$/, "")
  if (!rel || rel === "page.tsx") return "/"
  return `/${rel}`
    .replace(/\/\[\[\.\.\..+?\]\]/g, "")
    .replace(/\/\[.+?\]/g, "/:dynamic")
}

const concreteRoutes = new Set(walkPages(appRoot).map(pageToRoute))
const dynamicPrefixes = [...concreteRoutes]
  .filter((route) => route.includes(":dynamic"))
  .map((route) => route.split("/:dynamic")[0])

const knownMarketingRoutes = [
  "/",
  "/demo",
  "/features",
  "/features/ai-voice-agents",
  "/features/ai-chat-assistants",
  "/features/ai-chat-agents",
  "/features/ai-telephony",
  "/features/ai-sales-assistant",
  "/features/ai-customer-support",
  "/features/ai-lead-qualification",
  "/features/ai-appointment-scheduling",
  "/features/multilingual-ai",
  "/features/appointment-scheduling",
  "/features/crm-integrations",
  "/features/email-follow-up",
  "/features/analytics-reporting",
  "/features/website-knowledge-base",
  "/features/video-presenter",
  "/features/workflow-automation",
  "/solutions",
  "/solutions/shopify-ai-assistant",
  "/solutions/shopify-ai",
  "/solutions/e-commerce-ai",
  "/solutions/ecommerce",
  "/solutions/contractor-ai",
  "/solutions/contractors",
  "/solutions/real-estate-ai",
  "/solutions/real-estate",
  "/solutions/healthcare-ai",
  "/solutions/healthcare",
  "/solutions/automotive-ai",
  "/solutions/logistics-ai",
  "/solutions/roadside-assistance-ai",
  "/solutions/roadside-assistance",
  "/resources",
  "/resources/blog",
  "/resources/case-studies",
  "/resources/docs",
  "/resources/documentation",
  "/resources/help-center",
  "/resources/integrations",
  "/resources/api",
  "/resources/security",
  "/resources/setup-guide",
  "/resources/guides",
  "/pricing",
  "/pricing/voice-agent",
  "/pricing/chat-assistant",
  "/pricing/ai-telephony",
  "/pricing/combo",
  "/pricing/enterprise",
  "/pricing/shopify",
  "/pricing/agency",
  "/pricing/faq",
  "/company",
  "/company/about",
  "/company/contact",
  "/company/partners",
  "/company/partner-program",
  "/company/affiliate-program",
  "/company/careers",
  "/company/privacy",
  "/company/terms",
  "/company/status",
  "/privacy",
  "/terms",
  "/onboarding",
]

function resolves(route) {
  if (concreteRoutes.has(route)) return true
  return dynamicPrefixes.some((prefix) => route.startsWith(`${prefix}/`))
}

const missing = knownMarketingRoutes.filter((route) => !resolves(route))
if (missing.length) {
  console.error("Missing marketing routes:")
  for (const route of missing) console.error(`- ${route}`)
  process.exit(1)
}

console.log(`Marketing route audit passed (${knownMarketingRoutes.length} routes checked).`)
