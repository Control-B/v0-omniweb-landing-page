"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { BigFooter } from "@/components/big-footer"
import { Button } from "@/components/ui/button"
import {
  Eye,
  Zap,
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  ShoppingCart,
  Briefcase,
  Building2,
  Wrench,
  Cpu,
  UtensilsCrossed,
  Heart,
  GraduationCap,
} from "lucide-react"

const categories = [
  { label: "All", icon: Sparkles },
  { label: "E-Commerce", icon: ShoppingCart },
  { label: "Professional Services", icon: Briefcase },
  { label: "Agencies", icon: Building2 },
  { label: "Contractors", icon: Wrench },
  { label: "Technology", icon: Cpu },
  { label: "Food & Beverage", icon: UtensilsCrossed },
  { label: "Health & Wellness", icon: Heart },
  { label: "Education", icon: GraduationCap },
]

const templates = [
  {
    name: "Commerce Pro",
    category: "E-Commerce",
    description: "A modern e-commerce template with product showcases, cart, and checkout optimized for conversions.",
    price: 99,
    originalPrice: 149,
    rating: 4.9,
    reviews: 128,
    badge: "Best Seller",
    badgeColor: "bg-yellow-500/20 text-yellow-400",
    gradient: "from-orange-600/30 via-pink-600/20 to-rose-600/30",
    tags: ["AI Copy", "SEO Ready", "Mobile First"],
    features: ["Product catalog", "Cart & checkout", "Review system"],
  },
  {
    name: "Consultant Elite",
    category: "Professional Services",
    description: "Clean and professional template for consultants, advisors, and service-based businesses.",
    price: 79,
    originalPrice: 119,
    rating: 4.8,
    reviews: 94,
    badge: "Popular",
    badgeColor: "bg-blue-500/20 text-blue-400",
    gradient: "from-blue-600/30 via-cyan-600/20 to-blue-600/30",
    tags: ["Lead Gen", "Booking", "CRM Ready"],
    features: ["Booking system", "Lead capture forms", "Testimonials"],
  },
  {
    name: "Portfolio Studio",
    category: "Agencies",
    description: "Showcase your creative work with this stunning portfolio template built to win clients.",
    price: 89,
    originalPrice: null,
    rating: 4.7,
    reviews: 67,
    badge: "New",
    badgeColor: "bg-emerald-500/20 text-emerald-400",
    gradient: "from-purple-600/30 via-violet-600/20 to-purple-600/30",
    tags: ["Portfolio Grid", "Case Studies", "Contact Form"],
    features: ["Project showcases", "Team profiles", "Awards section"],
  },
  {
    name: "Local Pro",
    category: "Contractors",
    description: "Perfect for local service businesses with quote forms, project galleries, and Google Reviews.",
    price: 69,
    originalPrice: 99,
    rating: 4.9,
    reviews: 213,
    badge: "Top Rated",
    badgeColor: "bg-cyan-500/20 text-cyan-400",
    gradient: "from-cyan-600/30 via-teal-600/20 to-cyan-600/30",
    tags: ["Quote Forms", "Map Integration", "Reviews"],
    features: ["Service areas", "Quote requests", "Project gallery"],
  },
  {
    name: "SaaS Launch",
    category: "Technology",
    description: "Launch your SaaS product with this conversion-optimized template featuring pricing tables.",
    price: 119,
    originalPrice: 169,
    rating: 4.8,
    reviews: 52,
    badge: "Premium",
    badgeColor: "bg-purple-500/20 text-purple-400",
    gradient: "from-indigo-600/30 via-purple-600/20 to-pink-600/30",
    tags: ["Pricing Tables", "Feature Showcase", "Waitlist"],
    features: ["Pricing tables", "Feature grid", "FAQ section"],
  },
  {
    name: "Restaurant",
    category: "Food & Beverage",
    description: "Menu displays, online reservations, and ordering all in one stunning restaurant template.",
    price: 79,
    originalPrice: null,
    rating: 4.6,
    reviews: 41,
    badge: null,
    badgeColor: "",
    gradient: "from-red-600/30 via-orange-600/20 to-yellow-600/30",
    tags: ["Menu Display", "Reservations", "Online Orders"],
    features: ["Menu builder", "Table reservations", "Photo gallery"],
  },
  {
    name: "Wellness Studio",
    category: "Health & Wellness",
    description: "Calming, beautiful design for yoga studios, fitness coaches, spas, and wellness brands.",
    price: 79,
    originalPrice: 109,
    rating: 4.7,
    reviews: 38,
    badge: "New",
    badgeColor: "bg-emerald-500/20 text-emerald-400",
    gradient: "from-emerald-600/30 via-teal-600/20 to-green-600/30",
    tags: ["Class Booking", "Memberships", "Blog"],
    features: ["Class schedule", "Membership tiers", "Instructor profiles"],
  },
  {
    name: "Course Creator",
    category: "Education",
    description: "Sell courses, share knowledge, and grow your student base with this educator-first template.",
    price: 89,
    originalPrice: 129,
    rating: 4.5,
    reviews: 29,
    badge: null,
    badgeColor: "",
    gradient: "from-blue-600/30 via-indigo-600/20 to-violet-600/30",
    tags: ["Course Grid", "Enrollment", "Testimonials"],
    features: ["Course listings", "Student portal", "Progress tracking"],
  },
  {
    name: "Agency Growth",
    category: "Agencies",
    description: "Built for marketing and design agencies looking to impress prospects and close more deals.",
    price: 99,
    originalPrice: 139,
    rating: 4.8,
    reviews: 76,
    badge: "Popular",
    badgeColor: "bg-blue-500/20 text-blue-400",
    gradient: "from-violet-600/30 via-purple-600/20 to-fuchsia-600/30",
    tags: ["Case Studies", "Client Logos", "Services Grid"],
    features: ["Services grid", "Client logos", "Process timeline"],
  },
]

const features = [
  "AI-generated copy included",
  "Mobile-first responsive design",
  "SEO optimized out of the box",
  "Instant deployment to production",
  "Unlimited customizations",
  "Lifetime updates included",
]

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered = activeCategory === "All"
    ? templates
    : templates.filter((t) => t.category === activeCategory)

  return (
    <div className="flex min-h-dvh flex-col bg-[#050a12]">
      <Header />
      <main className="flex-1 pt-16">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section id="templates-overview" className="relative overflow-hidden border-b border-white/10">
          {/* BG — landing-page style: dark + gradient glow */}
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute bottom-0 left-0 h-[300px] w-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
            <div className="absolute bottom-0 right-0 h-[300px] w-[500px] rounded-full bg-cyan-600/10 blur-[100px]" />
            {/* Subtle mesh */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050a12]" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 text-center lg:px-8 lg:py-32">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-400" style={{ animation: "fadeInUp 0.7s ease both" }}>
              <Sparkles className="h-3.5 w-3.5" />
              Professionally Designed Templates
            </div>

            {/* Headline — Landing page style */}
            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl" style={{ animation: "fadeInUp 0.7s 0.1s ease both" }}>
              <span className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">Launch Faster with a</span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">Beautiful Template</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl" style={{ animation: "fadeInUp 0.7s 0.2s ease both" }}>
              Every template is AI-optimized, mobile-first, and ready to deploy in minutes.
              Pick your industry, customize your brand, go live today.
            </p>

            {/* Feature pills */}
            <div className="mb-12 flex flex-wrap items-center justify-center gap-3" style={{ animation: "fadeInUp 0.7s 0.3s ease both" }}>
              {features.map((f) => (
                <span key={f} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/60">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />{f}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-10 text-center" style={{ animation: "fadeInUp 0.7s 0.4s ease both" }}>
              <div><div className="text-3xl font-bold text-white">50+</div><div className="text-sm text-white/40">Templates</div></div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div><div className="text-3xl font-bold text-white">4.8★</div><div className="text-sm text-white/40">Avg Rating</div></div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div><div className="text-3xl font-bold text-white">738</div><div className="text-sm text-white/40">Happy Customers</div></div>
            </div>
          </div>
        </section>

        {/* ── Category Filter ────────────────────────────────────────── */}
        <section id="categories" className="sticky top-16 z-30 border-b border-white/10 bg-[#050a12]/90 px-4 py-4 backdrop-blur-xl lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeCategory === cat.label
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg"
                      : "border border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Templates Grid ─────────────────────────────────────────── */}
        <section id="template-grid" className="px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-white/40">Showing <span className="font-semibold text-white">{filtered.length}</span> templates</p>
              <select className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 focus:outline-none focus:ring-1 focus:ring-cyan-500">
                <option>Sort: Most Popular</option>
                <option>Sort: Newest</option>
                <option>Sort: Price: Low to High</option>
                <option>Sort: Highest Rated</option>
              </select>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((template) => (
                <div key={template.name} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-black/50">
                  {/* Preview */}
                  <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${template.gradient}`}>
                    {/* Mock browser */}
                    <div className="m-3 overflow-hidden rounded-xl border border-white/10 bg-[#050a12]/90">
                      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                        <span className="h-2 w-2 rounded-full bg-red-500/60" />
                        <span className="h-2 w-2 rounded-full bg-yellow-500/60" />
                        <span className="h-2 w-2 rounded-full bg-green-500/60" />
                        <div className="ml-2 h-2 flex-1 rounded-full bg-white/10" />
                      </div>
                      <div className="p-3">
                        <div className={`mb-2 h-16 rounded-lg bg-gradient-to-br ${template.gradient} opacity-60`} />
                        <div className="space-y-1.5">
                          <div className="h-2 w-3/4 rounded bg-white/10" />
                          <div className="h-2 w-1/2 rounded bg-white/10" />
                          <div className="mt-2 h-5 w-20 rounded-md bg-white/10" />
                        </div>
                      </div>
                    </div>

                    {/* Badge */}
                    {template.badge && (
                      <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${template.badgeColor}`}>
                        {template.badge}
                      </span>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/70 opacity-0 transition-all group-hover:opacity-100 backdrop-blur-sm">
                      <Button size="sm" variant="outline" asChild className="border-white/30 bg-black/40 hover:bg-white/10">
                        <Link href={`/templates/preview/${template.name.toLowerCase().replace(/\s+/g, "-")}`}>
                          <Eye className="mr-1.5 h-4 w-4" />Preview
                        </Link>
                      </Button>
                      <Button size="sm" asChild className="bg-gradient-to-r from-yellow-500 to-orange-500 font-semibold text-black hover:from-yellow-600 hover:to-orange-600">
                        <Link href={`/get-started?template=${template.name.toLowerCase().replace(/\s+/g, "-")}`}>
                          <Zap className="mr-1.5 h-4 w-4" />Use This
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <span className="mb-1 block text-xs font-medium text-cyan-400">{template.category}</span>
                        <h3 className="text-lg font-semibold">{template.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">${template.price}</div>
                        {template.originalPrice && (
                          <div className="text-sm text-white/30 line-through">${template.originalPrice}</div>
                        )}
                      </div>
                    </div>

                    <p className="mb-4 flex-1 text-sm leading-relaxed text-white/50">{template.description}</p>

                    {/* Tags */}
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {template.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/40">{tag}</span>
                      ))}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-white">{template.rating}</span>
                        <span className="text-xs text-white/30">({template.reviews} reviews)</span>
                      </div>
                      <Button size="sm" asChild className="bg-gradient-to-r from-yellow-500 to-orange-500 text-sm font-semibold text-black hover:from-yellow-600 hover:to-orange-600">
                        <Link href={`/get-started?template=${template.name.toLowerCase().replace(/\s+/g, "-")}`}>
                          Get Template
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Custom Template CTA ────────────────────────────────────── */}
        <section id="custom-design" className="px-4 pb-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-yellow-600/10 via-orange-600/5 to-pink-600/10 p-8 lg:p-12">
              <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-yellow-600/15 blur-[80px]" />
              <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-orange-600/15 blur-[80px]" />
              <div className="relative z-10 grid items-center gap-8 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-yellow-400">Bespoke Design</p>
                  <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Need Something Completely Custom?</h2>
                  <p className="mb-6 text-lg leading-relaxed text-white/60">
                    Our design team will build a template that is 100% unique to your brand — from color palette to layout to copy.
                  </p>
                  <ul className="space-y-2">
                    {["Dedicated designer assigned to your project", "3 revision rounds included", "Delivered in 5 business days", "Source files included"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                        <CheckCircle2 className="h-4 w-4 text-yellow-400" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-3 text-2xl font-bold">Custom Design</div>
                    <div className="mb-1 text-4xl font-bold text-yellow-400">$499</div>
                    <div className="mb-6 text-sm text-white/40">one-time payment</div>
                    <Button size="lg" asChild className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 font-semibold text-black hover:from-yellow-600 hover:to-orange-600">
                      <Link href="/get-started?plan=custom">Start Custom Order <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BigFooter />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
