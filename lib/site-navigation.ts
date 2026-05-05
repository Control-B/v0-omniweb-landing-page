import type { LucideIcon } from "lucide-react"
import {
  Activity,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Bot,
  CalendarDays,
  Code2,
  FileText,
  HeartPulse,
  HelpCircle,
  Home,
  Languages,
  Mail,
  MessageSquare,
  Mic,
  PhoneCall,
  PlugZap,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Video,
  Wrench,
  Workflow,
} from "lucide-react"

export type SiteNavSubItem = {
  label: string
  href: string
  description: string
  icon: LucideIcon
  iconClassName?: string
  iconChipClassName?: string
}

export type SiteNavItem = {
  label: string
  href: string
  items: SiteNavSubItem[]
  preview: {
    eyebrow: string
    title: string
    description: string
    href: string
    image?: string
    contentClassName?: string
    mediaClassName?: string
  }
}

export type SiteCta = {
  label: string
  href: string
}

const iconClass = {
  cyan: "text-cyan-200",
  blue: "text-blue-200",
  violet: "text-violet-200",
  purple: "text-purple-200",
  emerald: "text-emerald-200",
  amber: "text-amber-200",
  rose: "text-rose-200",
  sky: "text-sky-200",
  orange: "text-orange-200",
  teal: "text-teal-200",
  stone: "text-slate-200",
} as const

const chipClass = {
  cyan: "border-cyan-500/35 bg-gradient-to-br from-cyan-500/22 to-sky-500/18 shadow-[0_12px_30px_rgba(34,211,238,0.18)]",
  blue: "border-blue-500/35 bg-gradient-to-br from-blue-500/22 to-indigo-500/18 shadow-[0_12px_30px_rgba(59,130,246,0.18)]",
  violet: "border-violet-500/35 bg-gradient-to-br from-violet-500/22 to-fuchsia-500/18 shadow-[0_12px_30px_rgba(139,92,246,0.18)]",
  purple: "border-purple-500/35 bg-gradient-to-br from-purple-500/22 to-pink-500/18 shadow-[0_12px_30px_rgba(168,85,247,0.18)]",
  emerald: "border-emerald-500/35 bg-gradient-to-br from-emerald-500/22 to-teal-500/18 shadow-[0_12px_30px_rgba(16,185,129,0.18)]",
  amber: "border-amber-500/35 bg-gradient-to-br from-amber-500/22 to-orange-500/18 shadow-[0_12px_30px_rgba(245,158,11,0.18)]",
  rose: "border-rose-500/35 bg-gradient-to-br from-rose-500/22 to-orange-500/18 shadow-[0_12px_30px_rgba(244,63,94,0.18)]",
  sky: "border-sky-500/35 bg-gradient-to-br from-sky-500/22 to-indigo-500/18 shadow-[0_12px_30px_rgba(56,189,248,0.18)]",
  orange: "border-orange-500/35 bg-gradient-to-br from-orange-500/22 to-amber-500/18 shadow-[0_12px_30px_rgba(249,115,22,0.18)]",
  teal: "border-teal-500/35 bg-gradient-to-br from-teal-500/22 to-cyan-500/18 shadow-[0_12px_30px_rgba(20,184,166,0.18)]",
  stone: "border-white/10 bg-gradient-to-br from-white/10 to-white/5 shadow-[0_12px_30px_rgba(148,163,184,0.12)]",
} as const

function item(
  label: string,
  href: string,
  description: string,
  icon: LucideIcon,
  tone: keyof typeof iconClass = "cyan",
): SiteNavSubItem {
  return {
    label,
    href,
    description,
    icon,
    iconClassName: iconClass[tone],
    iconChipClassName: chipClass[tone],
  }
}

export const navItems: SiteNavItem[] = [
  {
    label: "Features",
    href: "/features",
    items: [
      item("AI Voice Agents", "/features/ai-voice-agents", "Answer inbound calls, qualify intent, and book the next step 24/7.", Mic, "purple"),
      item("AI Chat Assistants", "/features/ai-chat-assistants", "Turn website traffic into live conversations that capture and convert.", MessageSquare, "rose"),
      item("Lead Automation", "/features/lead-automation", "Score, summarize, route, and follow up with every high-intent lead.", Workflow, "orange"),
      item("Multilingual AI", "/features/multilingual-ai", "Speak the language of every buyer with instant multilingual support.", Languages, "teal"),
      item("Appointment Scheduling", "/features/appointment-scheduling", "Convert intent into booked time slots without back-and-forth scheduling.", CalendarDays, "cyan"),
      item("CRM Integrations", "/features/crm-integrations", "Push conversations and lead context into your existing CRM stack.", PlugZap, "blue"),
      item("Email Follow-Up", "/features/email-follow-up", "Send timely follow-up sequences based on conversation outcomes.", Mail, "emerald"),
      item("Analytics & Reporting", "/features/analytics-reporting", "See conversion, response-time, and pipeline performance at a glance.", BarChart3, "sky"),
      item("Website Knowledge Base", "/features/website-knowledge-base", "Let Omniweb answer from your site content, FAQs, and product docs.", BookOpen, "violet"),
      item("Video Presenter", "/features/video-presenter", "Use guided video experiences to explain offers and boost engagement.", Video, "purple"),
      item("Workflow Automation", "/features/workflow-automation", "Chain triggers, handoffs, and tasks into one revenue workflow.", Bot, "cyan"),
    ],
    preview: {
      eyebrow: "Core platform",
      title: "Sell with voice, chat, qualification, and workflow automation",
      description: "Explore the Omniweb capabilities that turn AI into a revenue engine for your business.",
      href: "/features",
      image: "/images/generated/templates-showcase.png",
    },
  },
  {
    label: "Solutions",
    href: "/solutions",
    items: [
      item("Shopify AI Assistant", "/solutions/shopify-ai-assistant", "Answer product questions, recover carts, and help shoppers buy faster.", ShoppingCart, "orange"),
      item("Local Service Businesses", "/solutions/local-service-businesses", "Automate local leads, quotes, and response speed for busy teams.", Building2, "blue"),
      item("Contractors", "/solutions/contractors", "Handle after-hours calls, quote requests, and job qualification instantly.", Wrench, "cyan"),
      item("Real Estate", "/solutions/real-estate", "Qualify buyers and renters while keeping listings, tours, and follow-up moving.", Home, "emerald"),
      item("Healthcare", "/solutions/healthcare", "Support intake, triage, reminders, and patient communication with care.", HeartPulse, "rose"),
      item("Home Services", "/solutions/home-services", "Book service calls, answer common questions, and route urgent requests.", Home, "teal"),
      item("Ecommerce", "/solutions/ecommerce", "Guide shoppers, answer objections, and keep more revenue from slipping away.", Store, "violet"),
      item("Professional Services", "/solutions/professional-services", "Qualify consultations and collect the right context before the first call.", Briefcase, "sky"),
      item("Roadside Assistance", "/solutions/roadside-assistance", "Capture urgent dispatch details and send help fast when every minute counts.", Truck, "amber"),
      item("AI Agency", "/solutions/ai-agency", "Package and deploy revenue-driving AI systems for client websites.", Bot, "purple"),
    ],
    preview: {
      eyebrow: "Featured",
      title: "AI systems tailored to how your business actually sells",
      description: "Explore verticalized service journeys that turn traffic into qualified leads, booked calls, and automated follow-up.",
      href: "/solutions",
      image: "/images/generated/solutions-ecommerce.png",
      contentClassName: "bottom-0 max-w-[88%] -translate-y-4 px-6 pb-2 pt-0",
      mediaClassName: "h-[17rem] w-full aspect-auto",
    },
  },
  {
    label: "Resources",
    href: "/resources",
    items: [
      item("Blog", "/resources/blog", "Marketing, product, and AI strategy articles for teams that want better conversion.", FileText, "violet"),
      item("Case Studies", "/resources/case-studies", "See how Omniweb improves response speed, lead quality, and follow-up.", BookOpen, "rose"),
      item("Docs", "/resources/docs", "Implementation docs, launch notes, and product reference material.", FileText, "blue"),
      item("Help Center", "/resources/help-center", "Find quick answers for setup, billing, and product usage.", HelpCircle, "cyan"),
      item("Integrations", "/resources/integrations", "Connect Omniweb to the tools your team already uses.", PlugZap, "teal"),
      item("Security", "/resources/security", "Review data handling, permissions, and platform security practices.", ShieldCheck, "emerald"),
      item("API", "/resources/api", "Build custom workflows with Omniweb's API and automation endpoints.", Code2, "sky"),
      item("Guides", "/resources/guides", "Practical rollout guides for launches, scripts, and optimization.", BookOpen, "amber"),
      item("Compare", "/resources/compare", "See how Omniweb stacks up against manual workflows and point tools.", BarChart3, "purple"),
    ],
    preview: {
      eyebrow: "Spotlight",
      title: "Learn the system before you book a call",
      description: "Use videos, case studies, and playbooks to understand how Omniweb drives sales, lead qualification, and automation.",
      href: "/resources",
      image: "/images/generated/resources-knowledge-hub.png",
    },
  },
  {
    label: "Pricing",
    href: "/pricing",
    items: [
      item("Voice Agent", "/pricing/voice-agent", "Price outbound and inbound voice coverage for teams that live on the phone.", Mic, "purple"),
      item("Chat Assistant", "/pricing/chat-assistant", "Choose chat coverage that converts site visits into qualified conversations.", MessageSquare, "rose"),
      item("AI Telephony", "/pricing/ai-telephony", "Package call handling, routing, and telephony for high-volume teams.", PhoneCall, "cyan"),
      item("Combo Plans", "/pricing/combo", "Bundle voice, chat, and automation into one unified revenue system.", Workflow, "blue"),
      item("Enterprise", "/pricing/enterprise", "Align multi-team governance, onboarding, and scale requirements.", Building2, "emerald"),
      item("Shopify", "/pricing/shopify", "Match ecommerce growth with store-specific conversion and support coverage.", ShoppingCart, "orange"),
      item("Agency", "/pricing/agency", "White-label or manage multiple client deployments with confidence.", Users, "violet"),
      item("Pricing FAQ", "/pricing/faq", "Get answers on setup, usage, scaling, and implementation details.", HelpCircle, "amber"),
    ],
    preview: {
      eyebrow: "Plan smarter",
      title: "Pricing built around outcomes, not software clutter",
      description: "Position value around qualified leads, handled conversations, and faster follow-up instead of random feature lists.",
      href: "/pricing",
      image: "/images/generated/pricing-growth-dashboard.png",
    },
  },
  {
    label: "Company",
    href: "/company",
    items: [
      item("About", "/company/about", "Understand the mission and team behind Omniweb's AI revenue platform.", Building2, "cyan"),
      item("Contact", "/company/contact", "Reach sales, support, and partnerships from a single company hub.", Mail, "blue"),
      item("Live AI Demo", "/demo", "Open the live assistant and try voice or chat for yourself.", CalendarDays, "violet"),
      item("Partners", "/company/partners", "See who builds with Omniweb and how we collaborate across channels.", Users, "emerald"),
      item("Careers", "/company/careers", "Explore open roles and the culture that shapes the product.", Briefcase, "orange"),
      item("Privacy Policy", "/company/privacy", "Review how Omniweb handles data, permissions, and privacy controls.", ShieldCheck, "teal"),
      item("Terms of Service", "/company/terms", "Read the terms that govern product use and service access.", FileText, "stone"),
      item("System Status", "/company/status", "Check uptime, incident updates, and service health details.", Activity, "sky"),
    ],
    preview: {
      eyebrow: "Behind the product",
      title: "Meet the team building AI systems that drive revenue",
      description: "Learn the vision behind Omniweb and how we help businesses automate conversations, qualification, and follow-up.",
      href: "/company",
      image: "/images/generated/company-innovation-team.png",
    },
  },
]

export const primaryCtas: SiteCta[] = [
  { label: "Get Started", href: "/get-started" },
  { label: "Try Live Demo", href: "/demo" },
  { label: "See Pricing", href: "/pricing" },
  { label: "Install AI Agent", href: "/dashboard/widget-install" },
  { label: "Talk to Sales", href: "/company/contact" },
]

export function isRouteActive(pathname: string | null | undefined, href: string) {
  const current = pathname?.split("#")[0] ?? "/"
  if (href === "/") return current === "/"
  return current === href || current.startsWith(`${href}/`)
}

export const footerGroups = navItems.map((group) => ({
  label: group.label,
  href: group.href,
  links: [{ label: `${group.label} Overview`, href: group.href }, ...group.items],
}))

export const marketingRouteSections = navItems.map((group) => group.href.replace(/^\//, ""))

export const allMarketingRoutes = [
  ...navItems.map((group) => group.href),
  ...navItems.flatMap((group) => group.items.map((item) => item.href)),
  ...primaryCtas.map((cta) => cta.href),
  "/demo",
  "/",
]
