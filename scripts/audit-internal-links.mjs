import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const repoRoot = process.cwd()
const scanRoots = ["app", "components", "lib"].map((dir) => join(repoRoot, dir))
const appRoot = join(repoRoot, "app")

function walk(dir, predicate, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, predicate, files)
    else if (predicate(full)) files.push(full)
  }
  return files
}

function pageToRoute(file) {
  const rel = relative(appRoot, file).replace(/\/page\.tsx$/, "")
  if (!rel || rel === "page.tsx") return "/"
  return `/${rel}`
    .replace(/\/\[\[\.\.\..+?\]\]/g, "")
    .replace(/\/\[.+?\]/g, "/:dynamic")
}

const routeFiles = walk(appRoot, (file) => file.endsWith("page.tsx"))
const concreteRoutes = new Set(routeFiles.map(pageToRoute))
const dynamicPrefixes = [...concreteRoutes]
  .filter((route) => route.includes(":dynamic"))
  .map((route) => route.split("/:dynamic")[0])

const generatedMarketingRoutes = [
  "/features/ai-chat-agents",
  "/features/ai-sales-assistant",
  "/features/ai-customer-support",
  "/features/ai-lead-qualification",
  "/features/ai-appointment-scheduling",
  "/features/ai-telephony",
  "/solutions/shopify-ai",
  "/solutions/e-commerce-ai",
  "/solutions/contractor-ai",
  "/solutions/real-estate-ai",
  "/solutions/healthcare-ai",
  "/solutions/roadside-assistance-ai",
  "/solutions/automotive-ai",
  "/solutions/logistics-ai",
  "/resources/documentation",
  "/resources/setup-guide",
  "/company/partner-program",
  "/company/affiliate-program",
]
for (const route of generatedMarketingRoutes) concreteRoutes.add(route)

function isInternalHref(value) {
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/api/") && !/\.(png|jpe?g|gif|svg|webp|mp4|webm|ico|pdf|txt|xml)$/i.test(value)
}

function normalizeHref(value) {
  return value.split("#")[0].split("?")[0].replace(/\/$/, "") || "/"
}

function resolves(route) {
  if (concreteRoutes.has(route)) return true
  return dynamicPrefixes.some((prefix) => route.startsWith(`${prefix}/`))
}

const files = scanRoots.flatMap((root) =>
  walk(root, (file) => /\.(tsx|ts|jsx|js)$/.test(file) && !file.includes(".next")),
)

const hrefs = []
for (const file of files) {
  const text = readFileSync(file, "utf8")
  const patterns = [
    /href=[{]?['"]([^'"{}]+)['"][}]?/g,
    /href:\s*['"]([^'"]+)['"]/g,
  ]
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text))) {
      const href = match[1]
      if (isInternalHref(href)) hrefs.push({ href: normalizeHref(href), file: relative(repoRoot, file) })
    }
  }
}

const missing = hrefs.filter(({ href }) => !resolves(href))
if (missing.length) {
  console.error("Broken static internal links:")
  for (const item of missing) console.error(`- ${item.href} (${item.file})`)
  process.exit(1)
}

console.log(`Internal link audit passed (${hrefs.length} static internal links checked).`)
