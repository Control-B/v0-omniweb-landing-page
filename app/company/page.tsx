import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

const values = [
  {
    title: "Innovation First",
    description: "We push the boundaries of what is possible with AI and web technology to deliver cutting-edge solutions.",
  },
  {
    title: "Customer Success",
    description: "Your success is our success. We measure our impact by the results our customers achieve.",
  },
  {
    title: "Simplicity",
    description: "We believe powerful technology should be easy to use. Complexity is the enemy of progress.",
  },
  {
    title: "Transparency",
    description: "No hidden fees, no surprises. We are upfront about our pricing, processes, and capabilities.",
  },
]

const team = [
  {
    name: "Alex Chen",
    role: "CEO & Co-Founder",
    bio: "Former tech lead at a Fortune 500 company with 15 years of experience in AI and web development.",
  },
  {
    name: "Sarah Mitchell",
    role: "CTO & Co-Founder",
    bio: "PhD in Machine Learning with a passion for making AI accessible to businesses of all sizes.",
  },
  {
    name: "Marcus Johnson",
    role: "Head of Design",
    bio: "Award-winning designer focused on creating beautiful, conversion-optimized user experiences.",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Customer Success",
    bio: "Dedicated to ensuring every Omniweb customer achieves their business goals.",
  },
]

export default function CompanyPage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="border-b border-white/10 px-4 py-20 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            About Us
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-5xl">
            Building the Future of Web
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Omniweb is on a mission to democratize AI-powered web experiences. We help businesses of all sizes create websites that truly work for them.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold">Our Story</h2>
          <div className="prose prose-invert mx-auto max-w-none text-muted-foreground">
            <p className="mb-4 leading-relaxed">
              Founded in 2024, Omniweb started with a simple observation: most businesses struggle to create websites that actually convert visitors into customers. Traditional web development is expensive, slow, and often produces underwhelming results.
            </p>
            <p className="mb-4 leading-relaxed">
              We asked ourselves: what if AI could bridge this gap? What if we could make it possible for any business to have a website that not only looks great but actively helps them grow?
            </p>
            <p className="leading-relaxed">
              Today, Omniweb powers thousands of websites across industries, from local contractors to national e-commerce brands. Our AI technology continuously optimizes each site for maximum conversions, while our human team provides the support and expertise our customers need to succeed.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="border-t border-white/10 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-2xl font-bold">Our Values</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="rounded-xl border border-white/10 bg-card/50 p-6">
                <h3 className="mb-3 font-semibold">{value.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-white/10 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-2xl font-bold">Meet the Team</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                  <span className="text-2xl font-bold text-cyan-400">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="mb-1 font-semibold">{member.name}</h3>
                <p className="mb-3 text-sm text-cyan-400">{member.role}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-white/10 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-bold">Get in Touch</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <h3 className="mb-6 text-lg font-semibold">Contact Information</h3>
              <div className="space-y-4">
                <a
                  href="mailto:support@omniweb.ai"
                  className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-5 w-5 text-cyan-400" />
                  support@omniweb.ai
                </a>
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="h-5 w-5 text-cyan-400" />
                  +1 (234) 567-890
                </a>
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5 shrink-0 text-cyan-400" />
                  <span>
                    123 Innovation Way
                    <br />
                    San Francisco, CA 94102
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="mb-6 text-lg font-semibold">Send Us a Message</h3>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <textarea
                  placeholder="Your message"
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Join the Omniweb Community</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Start building your AI-powered website today.
          </p>
          <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/get-started">Get Started</Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  )
}
