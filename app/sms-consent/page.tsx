import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

const sections = [
  {
    title: "SMS Consent Policy",
    intro: true,
    body: [
      "Omniweb provides AI-powered communication services, including SMS notifications and messaging. This policy describes how Omniweb collects consent for SMS communications in compliance with applicable regulations, including TCPA and CTIA guidelines.",
    ],
  },
  {
    title: "1. How Users Opt In",
    body: ["Users may opt in to receive SMS messages from Omniweb by:"],
    bullets: [
      "Initiating contact via phone call with our AI system",
      "Submitting forms on https://omniweb.ai",
      "Engaging with AI assistants and requesting follow-up communication",
    ],
    note: "Consent to receive SMS messages is never a condition of purchase or service.",
  },
  {
    title: "2. Types of Messages",
    body: ["By opting in, users may receive the following types of SMS messages:"],
    bullets: [
      "Customer support messages",
      "Service-related notifications",
      "AI assistant follow-ups",
    ],
    note: "Omniweb does not send unsolicited marketing messages.",
  },
  {
    title: "3. Message Frequency",
    body: [
      "Message frequency varies based on user interaction and the nature of the service requested. Users will not receive messages unrelated to their engagement with Omniweb's platform.",
    ],
  },
  {
    title: "4. Opt-Out Instructions",
    body: ["Users can opt out of SMS messages at any time. To stop receiving messages, reply:"],
    items: [
      {
        heading: "STOP",
        bullets: [
          "Reply STOP to any message to immediately unsubscribe.",
          "You will receive a one-time confirmation that you have been unsubscribed.",
          "After opting out, no further SMS messages will be sent unless you re-opt in.",
        ],
      },
    ],
  },
  {
    title: "5. Help Instructions",
    body: ["For assistance with SMS messages, reply:"],
    items: [
      {
        heading: "HELP",
        bullets: [
          "Reply HELP to any message to receive support information.",
          "You may also contact us directly at: support@omniweb.ai",
        ],
      },
    ],
  },
  {
    title: "6. Message & Data Rates",
    body: [
      "Message and data rates may apply depending on the user's mobile carrier and plan. Omniweb is not responsible for any charges incurred from your wireless carrier. Contact your carrier for details about your messaging plan.",
    ],
  },
  {
    title: "7. Privacy",
    body: [
      "Omniweb does not share, sell, or disclose your mobile phone number to third parties for marketing purposes. Your information is used solely to deliver the SMS communications you have consented to receive.",
      "For full details on how we handle your personal data, please review our Privacy Policy:",
    ],
    link: {
      label: "https://omniweb.ai/privacy",
      href: "/privacy",
    },
  },
  {
    title: "8. Contact Us",
    body: [
      "If you have questions about this SMS Consent Policy, please contact us:",
    ],
    bullets: [
      "Email: support@omniweb.ai",
      "Website: https://omniweb.ai",
    ],
  },
]

export default function SmsConsentPage() {
  return (
    <div className="min-h-dvh bg-[#050a12] text-white">
      <Header />
      <main className="border-b border-white/10">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8 lg:p-12">
            <p className="site-eyebrow mb-4">Legal</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">SMS CONSENT POLICY — OMNIWEB</h1>
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
                    <p className="rounded-xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-3 text-sm font-medium text-cyan-300/90">
                      {(section as any).note}
                    </p>
                  ) : null}

                  {(section as any).link ? (
                    <a
                      href={(section as any).link.href}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
                    >
                      {(section as any).link.label}
                    </a>
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
