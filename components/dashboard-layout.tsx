"use client"

import { useMemo, useState } from "react"
import { Bot, Building2, LineChart, Mic, PlugZap, Save, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dispatchAssistantOpen } from "@/lib/assistant-events"

type DashboardLayoutProps = {
  firstName: string
  email: string
}

const onboardingSteps = [
  { key: "businessType", label: "Business type selection", helper: "Choose the sales model and vertical your agents will support." },
  { key: "services", label: "Services offered", helper: "Define the offers AI should explain, qualify, and route." },
  { key: "contact", label: "Contact info", helper: "Capture the emails, phones, and calendars your AI should use." },
  { key: "goals", label: "AI goals", helper: "Tell Omniweb whether to optimize for sales, support, booking, or follow-up." },
  { key: "integrations", label: "Connect integrations", helper: "Optionally connect CRM, calendar, forms, and phone providers." },
]

export function DashboardLayout({ firstName, email }: DashboardLayoutProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState({
    businessType: "Shopify store",
    services: "Sales calls, support FAQs, appointment booking",
    contactName: firstName,
    contactEmail: email,
    contactPhone: "",
    goals: "Increase qualified leads and automate follow-up",
    integrations: "HubSpot, Google Calendar, Payments",
  })

  const completion = useMemo(() => Math.round(((currentStep + 1) / onboardingSteps.length) * 100), [currentStep])

  const fieldsByStep = [
    <Input key="businessType" value={form.businessType} onChange={(event) => setForm({ ...form, businessType: event.target.value })} className="border-white/10 bg-white/5" />,
    <textarea key="services" value={form.services} onChange={(event) => setForm({ ...form, services: event.target.value })} className="min-h-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />,
    <div key="contact" className="grid gap-3 md:grid-cols-2">
      <Input value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} className="border-white/10 bg-white/5" placeholder="Contact name" />
      <Input value={form.contactEmail} onChange={(event) => setForm({ ...form, contactEmail: event.target.value })} className="border-white/10 bg-white/5" placeholder="Email" />
      <Input value={form.contactPhone} onChange={(event) => setForm({ ...form, contactPhone: event.target.value })} className="border-white/10 bg-white/5 md:col-span-2" placeholder="Phone" />
    </div>,
    <textarea key="goals" value={form.goals} onChange={(event) => setForm({ ...form, goals: event.target.value })} className="min-h-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />,
    <Input key="integrations" value={form.integrations} onChange={(event) => setForm({ ...form, integrations: event.target.value })} className="border-white/10 bg-white/5" placeholder="HubSpot, Salesforce, Jobber..." />,
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Client dashboard</p>
          <h2 className="site-h2 mt-3">Configure AI that sells for you</h2>
          <h3 className="site-h3 mt-4 max-w-2xl">
            Launch voice agents, chat assistants, lead qualification, and follow-up automation from one control center.
          </h3>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => dispatchAssistantOpen("voice")}>
            <Mic className="mr-2 h-4 w-4" />
            Test voice agent
          </Button>
          <Button className="rounded-full bg-white text-slate-950 hover:bg-slate-100">
            <Save className="mr-2 h-4 w-4" />
            Save configuration
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: Bot, title: "Active agents", value: "3", note: "Voice, chat, SDR" },
          { icon: LineChart, title: "Qualified leads", value: "128", note: "Past 30 days" },
          { icon: Building2, title: "Revenue pipeline", value: "$42.8k", note: "Attributed to AI" },
          { icon: PlugZap, title: "Integrations", value: "5", note: "CRM + calendar live" },
        ].map((item) => (
          <div key={item.title} className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
            <item.icon className="h-5 w-5 text-cyan-300" />
            <p className="mt-5 text-sm text-slate-400">{item.title}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
            <p className="mt-1 text-sm text-slate-500">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,36,0.94),rgba(6,11,24,0.88))] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Onboarding flow</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Step {currentStep + 1} of {onboardingSteps.length}</h2>
            </div>
            <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">{completion}% complete</div>
          </div>
          <div className="mt-6 space-y-3">
            {onboardingSteps.map((step, index) => (
              <button key={step.key} onClick={() => setCurrentStep(index)} className={[
                "w-full rounded-2xl border px-4 py-4 text-left transition",
                index === currentStep ? "border-cyan-400/30 bg-cyan-400/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
              ].join(" ")}>
                <div className="flex items-start gap-3">
                  <div className={[
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    index === currentStep ? "bg-cyan-400 text-slate-950" : "bg-white/10 text-white",
                  ].join(" ")}>{index + 1}</div>
                  <div>
                    <p className="font-medium text-white">{step.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{step.helper}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,36,0.94),rgba(6,11,24,0.88))] p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-cyan-300" />
            <div>
              <h2 className="text-2xl font-semibold text-white">{onboardingSteps[currentStep].label}</h2>
              <p className="mt-1 text-sm text-slate-400">This scaffold can save to `/api/onboard` and `businesses` in the platform database.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {fieldsByStep[currentStep]}
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300/75">
              AI recommendation: start with lead qualification + booking, then add voice once your FAQs and routing rules are approved.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setCurrentStep((value) => Math.max(value - 1, 0))}>
                Previous
              </Button>
              <Button className="rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white hover:from-cyan-400 hover:via-blue-500 hover:to-purple-400" onClick={() => setCurrentStep((value) => Math.min(value + 1, onboardingSteps.length - 1))}>
                Next step
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
