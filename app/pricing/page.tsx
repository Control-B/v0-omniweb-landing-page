import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    description: "Perfect for small businesses just getting started online.",
    price: "$49",
    period: "/month",
    features: [
      "AI-powered website builder",
      "5 pages included",
      "Basic analytics",
      "SSL certificate",
      "Mobile responsive",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/get-started?plan=starter",
    popular: false,
  },
  {
    name: "Professional",
    description: "For growing businesses that need more power and features.",
    price: "$99",
    period: "/month",
    features: [
      "Everything in Starter",
      "Unlimited pages",
      "Advanced analytics",
      "AI lead qualification",
      "Custom integrations",
      "Priority support",
      "A/B testing",
      "Custom domain",
    ],
    cta: "Start Free Trial",
    href: "/get-started?plan=professional",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Custom solutions for large organizations with complex needs.",
    price: "Custom",
    period: "",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom AI training",
      "White-label options",
      "SLA guarantee",
      "Advanced security",
      "API access",
      "Onboarding assistance",
    ],
    cta: "Contact Sales",
    href: "/company?contact=sales",
    popular: false,
  },
]

const faqs = [
  {
    question: "Can I try Omniweb before committing?",
    answer: "Yes! All plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "Can I change plans later?",
    answer: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
  },
  {
    question: "Is there a setup fee?",
    answer: "No setup fees for Starter and Professional plans. Enterprise plans may include onboarding services.",
  },
]

export default function PricingPage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="border-b border-white/10 px-4 py-20 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Pricing
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Choose the plan that fits your business. All plans include our core AI features with no hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.popular
                    ? "border-cyan-500 bg-gradient-to-b from-cyan-500/10 to-transparent"
                    : "border-white/10 bg-card/50"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="mb-2 text-xl font-semibold">{plan.name}</h3>
                <p className="mb-6 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-5 w-5 shrink-0 text-cyan-400" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full ${
                    plan.popular
                      ? "bg-cyan-500 text-white hover:bg-cyan-600"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="border-t border-white/10 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-white/10 bg-card/50 p-6">
                <h3 className="mb-3 font-semibold">{faq.question}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Start your 14-day free trial today. No credit card required.
          </p>
          <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/get-started">Start Free Trial</Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  )
}
