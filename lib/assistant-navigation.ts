export type AssistantAction = {
  type: "navigate" | "support" | "lead"
  label: string
  href: string
  service?: string
  intent?: string
  summary?: string
}

const TYPO_NORMALIZATIONS: Array<[RegExp, string]> = [
  [/\bresorces\b/g, "resources"],
  [/\brecources\b/g, "resources"],
  [/\bsignin\b/g, "sign in"],
  [/\bsignup\b/g, "sign up"],
]

const NAVIGATION_RULES: Array<{ aliases: string[]; action: AssistantAction }> = [
  {
    aliases: ["home", "homepage", "home page", "landing page", "main page", "main website"],
    action: { type: "navigate", label: "Open Home", href: "/", summary: "Opening the home page now." },
  },
  {
    aliases: ["faq", "faqs", "frequently asked questions", "pricing faq"],
    action: { type: "navigate", label: "Open FAQ Section", href: "/pricing#faq", summary: "Opening the FAQ section now." },
  },
  {
    aliases: ["pricing plans", "plans section", "pricing section", "plans"],
    action: { type: "navigate", label: "Open Plans Section", href: "/pricing#plans", summary: "Opening the plans section now." },
  },
  {
    aliases: ["industry solutions", "solution types", "solutions section"],
    action: { type: "navigate", label: "Open Industry Solutions Section", href: "/solutions#industry-solutions", summary: "Opening the industry solutions section now." },
  },
  {
    aliases: ["features", "features section", "ai features"],
    action: { type: "navigate", label: "Open Features Section", href: "/solutions#features", summary: "Opening the features section now." },
  },
  {
    aliases: ["how it works", "process", "steps"],
    action: { type: "navigate", label: "Open How It Works Section", href: "/solutions#how-it-works", summary: "Opening the how-it-works section now." },
  },
  {
    aliases: ["testimonials", "reviews", "customer stories", "results"],
    action: { type: "navigate", label: "Open Testimonials Section", href: "/solutions#testimonials", summary: "Opening the testimonials section now." },
  },
  {
    aliases: ["solutions", "solution", "services", "service", "what you offer", "offerings"],
    action: { type: "navigate", label: "Open Solutions", href: "/solutions", summary: "Opening the Solutions page now." },
  },
  {
    aliases: ["pricing", "price", "cost", "plan", "plans", "packages"],
    action: { type: "navigate", label: "Open Pricing", href: "/pricing", summary: "Opening the Pricing page now." },
  },
  {
    aliases: ["template categories", "categories", "template filter"],
    action: { type: "navigate", label: "Open Template Categories", href: "/templates#categories", summary: "Opening the template categories section now." },
  },
  {
    aliases: ["template grid", "template list", "browse templates"],
    action: { type: "navigate", label: "Open Template Grid", href: "/templates#template-grid", summary: "Opening the template grid now." },
  },
  {
    aliases: ["custom design", "custom template", "bespoke design"],
    action: { type: "navigate", label: "Open Custom Design Section", href: "/templates#custom-design", summary: "Opening the custom design section now." },
  },
  {
    aliases: ["templates", "template", "designs", "examples", "layouts"],
    action: { type: "navigate", label: "Open Templates", href: "/templates", summary: "Opening the Templates page now." },
  },
  {
    aliases: ["resource library", "browse library"],
    action: { type: "navigate", label: "Open Resource Library", href: "/resources#library", summary: "Opening the resource library section now." },
  },
  {
    aliases: ["articles", "featured articles", "blog articles", "case studies section"],
    action: { type: "navigate", label: "Open Articles Section", href: "/resources#articles", summary: "Opening the articles section now." },
  },
  {
    aliases: ["video library", "videos section", "popular videos"],
    action: { type: "navigate", label: "Open Videos Section", href: "/resources#videos", summary: "Opening the videos section now." },
  },
  {
    aliases: ["newsletter", "subscribe", "newsletter signup"],
    action: { type: "navigate", label: "Open Newsletter Section", href: "/resources#newsletter", summary: "Opening the newsletter section now." },
  },
  {
    aliases: ["resources", "resource", "guides", "guide", "case study", "case studies", "docs", "blog", "videos", "video library", "knowledge hub"],
    action: { type: "navigate", label: "Open Resources", href: "/resources", summary: "Opening the Resources page now." },
  },
  {
    aliases: ["company", "about", "about us", "team"],
    action: { type: "navigate", label: "Open Company", href: "/company", summary: "Opening the Company page now." },
  },
  {
    aliases: ["contact", "contact us", "get in touch", "sales", "talk to sales", "company contact"],
    action: { type: "navigate", label: "Open Contact Section", href: "/company#contact", summary: "Opening the contact section now." },
  },
  {
    aliases: ["careers", "career", "jobs", "job openings", "open positions", "hiring"],
    action: { type: "navigate", label: "Open Careers Section", href: "/company#careers", summary: "Opening the careers section now." },
  },
  {
    aliases: ["get started", "start", "trial", "signup", "sign up", "onboarding", "onboard"],
    action: { type: "lead", label: "Open Get Started", href: "/get-started", summary: "Opening the Get Started page now." },
  },
  {
    aliases: ["sign in", "log in", "login", "account login"],
    action: { type: "navigate", label: "Open Sign In", href: "/signin", summary: "Opening the Sign In page now." },
  },
  {
    aliases: ["dashboard", "my dashboard", "account dashboard"],
    action: { type: "navigate", label: "Open Dashboard", href: "/dashboard", summary: "Opening the Dashboard page now." },
  },
  {
    aliases: ["admin", "admin page", "admin panel"],
    action: { type: "navigate", label: "Open Admin", href: "/admin", summary: "Opening the Admin page now." },
  },
]

export function normalizeIntentText(message: string) {
  let normalized = message.toLowerCase().trim()

  for (const [pattern, replacement] of TYPO_NORMALIZATIONS) {
    normalized = normalized.replace(pattern, replacement)
  }

  return normalized
}

export function inferAssistantAction(message: string): AssistantAction | null {
  const normalized = normalizeIntentText(message)

  for (const rule of NAVIGATION_RULES) {
    if (rule.aliases.some((alias) => normalized.includes(alias))) {
      return rule.action
    }
  }

  return null
}

export function buildVoiceFollowUp(action: AssistantAction) {
  const label = action.label.replace(/^Open\s+/i, "").replace(/^Go To\s+/i, "")

  if (action.type === "support") {
    return "I'm still here with you. If you need help with anything on this support path, just ask."
  }

  return `I've opened the ${label} page. Is there anything specific you're looking for here, or any questions I can help with?`
}

export function buildAssistantFallback(message: string) {
  const action = inferAssistantAction(message)

  if (!action) {
    return { content: "", actions: [] as AssistantAction[] }
  }

  return {
    content: action.summary ?? "",
    actions: [action],
  }
}