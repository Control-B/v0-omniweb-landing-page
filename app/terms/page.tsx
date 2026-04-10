import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

const sections = [
  {
    title: "1. Acceptance",
    body: ["By using Omniweb, you agree to these Terms."],
  },
  {
    title: "2. Services",
    body: ["Omniweb provides:"],
    bullets: [
      "AI chat and voice agents",
      "Website templates",
      "Automation tools",
      "SaaS infrastructure",
    ],
  },
  {
    title: "3. User Accounts",
    bullets: [
      "You are responsible for account security",
      "Provide accurate information",
    ],
  },
  {
    title: "4. Acceptable Use",
    body: ["You agree NOT to:"],
    bullets: [
      "Use Services for illegal purposes",
      "Abuse AI systems",
      "Violate third-party rights",
      "Upload harmful or malicious content",
    ],
  },
  {
    title: "5. AI Limitations",
    bullets: [
      "AI outputs may be incorrect",
      "No guarantees of accuracy or outcomes",
      "Not professional advice",
    ],
  },
  {
    title: "6. Templates & Content",
    bullets: [
      "Users retain ownership of their content",
      "Omniweb grants license to use templates",
      "No guarantee templates meet legal/business needs",
    ],
  },
  {
    title: "7. Payments",
    bullets: [
      "Fees are non-refundable unless stated",
      "You are responsible for charges incurred",
    ],
  },
  {
    title: "8. Third-Party Services",
    bullets: [
      "Omniweb relies on third-party providers",
      "We are not liable for their performance",
    ],
  },
  {
    title: "9. Telephony & Communications",
    bullets: [
      "Calls may be recorded",
      "Users must comply with local call recording laws",
    ],
  },
  {
    title: "10. Limitation of Liability",
    body: ["To the fullest extent permitted by law, Omniweb is not liable for:"],
    bullets: [
      "Business losses",
      "Service interruptions",
      "AI errors or decisions",
      "Third-party failures",
    ],
  },
  {
    title: "11. Indemnification",
    body: ["You agree to defend and indemnify Omniweb against claims arising from your use."],
  },
  {
    title: "12. Termination",
    body: ["We may suspend or terminate accounts for violations."],
  },
  {
    title: "13. Intellectual Property",
    bullets: [
      "Omniweb owns platform technology",
      "Users own their content",
    ],
  },
  {
    title: "14. Disclaimers",
    body: ['Services provided "AS IS" without warranties.'],
  },
  {
    title: "15. Governing Law",
    items: [
      {
        heading: "Governing Law",
        body: "These Terms shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law principles.",
      },
      {
        heading: "Venue (Courts)",
        body: "Any legal action or proceeding arising under these Terms shall be brought exclusively in the state or federal courts located in Florida.",
      },
      {
        heading: "Arbitration",
        body: "Any disputes arising out of or relating to these Terms or the Services shall be resolved through binding arbitration, except where prohibited by law.",
      },
    ],
  },
  {
    title: "16. Changes",
    body: ["We may update these Terms at any time. Continued use of the Services constitutes acceptance of the updated Terms."],
  },
  {
    title: "17. Contact",
    body: ["Email: support@omniweb.ai"],
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-[#050a12] text-white">
      <Header />
      <main className="border-b border-white/10">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8 lg:p-12">
            <p className="site-eyebrow mb-4">Legal</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">TERMS OF USE — OMNIWEB</h1>
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
                    <div key={item.heading} className="space-y-2 rounded-2xl border border-white/8 bg-black/20 p-4 sm:p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">{item.heading}</h3>
                      <p className="text-base leading-8 text-white/75">{item.body}</p>
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
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
