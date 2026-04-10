import { BigFooter } from "@/components/big-footer"
import { Header } from "@/components/header"

const sections = [
  {
    title: "1. Overview",
    body: [
      "Omniweb provides AI-powered tools, including website templates, chat and voice agents, automation, and related services (\"Services\"). This Privacy Policy explains how we collect, use, disclose, and protect personal data.",
    ],
  },
  {
    title: "2. Data We Collect",
    items: [
      {
        heading: "A. Information You Provide",
        bullets: ["Name, email, phone number", "Account credentials", "Content you submit (text, files, prompts, templates)"],
      },
      {
        heading: "B. Automatically Collected Data",
        bullets: ["IP address, device/browser info", "Usage data (pages, actions, logs)", "Cookies and analytics data"],
      },
      {
        heading: "C. AI & Communication Data",
        bullets: ["Voice recordings and call metadata", "Transcriptions of calls and chats", "AI interaction logs"],
      },
      {
        heading: "D. Location Data",
        bullets: ["Approximate or precise location (if permission granted)"],
      },
      {
        heading: "E. Third-Party Data",
        bullets: ["Data from integrations, APIs, or connected services"],
      },
    ],
  },
  {
    title: "3. How We Use Data",
    bullets: [
      "Provide and operate Services",
      "Deliver AI responses and automation",
      "Customize templates and applications",
      "Communicate with users (calls, SMS, email)",
      "Improve performance, models, and features",
      "Ensure security and prevent fraud",
      "Comply with legal obligations",
    ],
  },
  {
    title: "4. Sharing of Data",
    body: ["We may share data with:"],
    bullets: [
      "Service Providers (hosting, AI, analytics)",
      "Communication Providers such as LiveKit or Twilio",
      "Business Users / Clients using Omniweb services",
      "Legal Authorities when required",
    ],
    note: "We do not sell personal data.",
  },
  {
    title: "5. AI & Automation Disclosure",
    bullets: [
      "AI outputs may be inaccurate or incomplete",
      "Outputs are not guaranteed for business, legal, or professional use",
      "Users are responsible for decisions made using AI outputs",
    ],
  },
  {
    title: "6. Voice & Call Recording",
    body: ["Calls and voice interactions may be recorded and transcribed.", "Used for:"],
    bullets: ["Service delivery", "Quality assurance", "AI improvement"],
  },
  {
    title: "7. Multi-Tenant SaaS (Client Data)",
    body: ["Businesses using Omniweb control their customer data.", "Omniweb acts as:"],
    bullets: ["Data Processor (on behalf of clients)", "Data Controller (for platform data)"],
  },
  {
    title: "8. Data Retention",
    body: ["Data is retained only as long as necessary:"],
    bullets: ["Service operation", "Legal compliance", "Dispute resolution"],
  },
  {
    title: "9. Security",
    body: ["We implement reasonable safeguards including:"],
    bullets: ["Encryption", "Access controls", "Secure infrastructure", "However, no system is 100% secure."],
  },
  {
    title: "10. Your Rights",
    body: ["Depending on jurisdiction, you may:"],
    bullets: [
      "Access your data",
      "Request deletion",
      "Correct inaccuracies",
      "Opt out of communications",
      "Contact: privacy@omniweb.ai",
    ],
  },
  {
    title: "11. Cookies",
    body: ["We use cookies for:"],
    bullets: ["Analytics", "Performance", "User experience", "You can manage cookies via browser settings."],
  },
  {
    title: "12. Third-Party Services",
    body: ["Omniweb integrates with third-party providers. We are not responsible for their privacy practices."],
  },
  {
    title: "13. Children’s Privacy",
    body: ["Services are not intended for users under 13 (or applicable age)."],
  },
  {
    title: "14. Changes to Policy",
    body: ["We may update this policy. Continued use = acceptance."],
  },
  {
    title: "15. Contact",
    body: ["Email: support@omniweb.ai"],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-[#050a12] text-white">
      <Header />
      <main className="border-b border-white/10">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8 lg:p-12">
            <p className="site-eyebrow mb-4">Privacy Policy</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">PRIVACY POLICY — OMNIWEB</h1>
            <div className="mt-4 space-y-1 text-sm text-white/60">
              <p>Effective Date: April 10, 2026</p>
              <p>Company: Omniweb, Inc. ("Omniweb," "we," "us," "our")</p>
              <p>Website: https://omniweb.ai</p>
            </div>

            <div className="mt-10 space-y-10">
              {sections.map((section) => (
                <section key={section.title} className="space-y-4">
                  <h2 className="text-xl font-semibold text-white sm:text-2xl">{section.title}</h2>

                  {section.body?.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-8 text-white/75">
                      {paragraph}
                    </p>
                  ))}

                  {section.items?.map((item) => (
                    <div key={item.heading} className="space-y-3 rounded-2xl border border-white/8 bg-black/20 p-4 sm:p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">{item.heading}</h3>
                      <ul className="space-y-2 text-base leading-7 text-white/75">
                        {item.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {section.bullets ? (
                    <ul className="space-y-2 text-base leading-7 text-white/75">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {(section as any).note ? (
                    <p className="text-sm font-medium text-cyan-300/90">{(section as any).note}</p>
                  ) : null}
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
      <BigFooter />
    </div>
  )
}
