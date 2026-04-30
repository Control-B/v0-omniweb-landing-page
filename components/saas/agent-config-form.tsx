"use client"

import { useState } from "react"
import { ShieldAlert } from "lucide-react"

type AgentConfigFormProps = {
  initialConfig: {
    agentName: string
    welcomeMessage: string
    tone: "professional"
    goals: string[]
    supportedLanguages: string[]
    active: boolean
  }
}

const goalOptions = [
  { value: "lead_qualification", label: "Lead Qualification" },
  { value: "customer_support", label: "Customer Support & FAQs" },
  { value: "sales_assistance", label: "Sales Assistance" },
  { value: "product_recommendations", label: "Product Recommendations" },
  { value: "cart_management", label: "Cart Management & Reminders" },
  { value: "appointment_booking", label: "Appointment Booking" },
  { value: "order_tracking", label: "Order Tracking & Status" },
  { value: "multilingual_support", label: "Multilingual Support" },
]

const allGoalValues = goalOptions.map((goal) => goal.value)

const languageOptions = [
  { value: "auto", label: "Auto (detect language)", flag: "🌐" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Spanish", flag: "🇪🇸" },
  { value: "fr", label: "French", flag: "🇫🇷" },
  { value: "de", label: "German", flag: "🇩🇪" },
  { value: "it", label: "Italian", flag: "🇮🇹" },
  { value: "pt", label: "Portuguese", flag: "🇧🇷" },
  { value: "nl", label: "Dutch", flag: "🇳🇱" },
  { value: "sv", label: "Swedish", flag: "🇸🇪" },
  { value: "ro", label: "Romanian", flag: "🇷🇴" },
  { value: "ru", label: "Russian", flag: "🇷🇺" },
  { value: "uk", label: "Ukrainian", flag: "🇺🇦" },
  { value: "pl", label: "Polish", flag: "🇵🇱" },
  { value: "ar", label: "Arabic", flag: "🇸🇦" },
  { value: "tr", label: "Turkish", flag: "🇹🇷" },
  { value: "hi", label: "Hindi", flag: "🇮🇳" },
  { value: "bn", label: "Bengali", flag: "🇧🇩" },
  { value: "zh", label: "Chinese", flag: "🇨🇳" },
  { value: "ja", label: "Japanese", flag: "🇯🇵" },
  { value: "ko", label: "Korean", flag: "🇰🇷" },
  { value: "id", label: "Indonesian", flag: "🇮🇩" },
  { value: "vi", label: "Vietnamese", flag: "🇻🇳" },
  { value: "fil", label: "Filipino", flag: "🇵🇭" },
  { value: "sw", label: "Swahili", flag: "🇰🇪" },
]

const inputClassName = "mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
const textareaClassName = "mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
const sectionClassName = "rounded-[1.75rem] border border-slate-200 bg-white/80 p-5 shadow-[0_10px_25px_rgba(148,163,184,0.08)]"

export function AgentConfigForm({ initialConfig }: AgentConfigFormProps) {
  const [agentName, setAgentName] = useState(initialConfig.agentName)
  const [welcomeMessage, setWelcomeMessage] = useState(initialConfig.welcomeMessage)
  const [tone] = useState(initialConfig.tone)
  const [goals, setGoals] = useState(initialConfig.goals)
  const [supportedLanguages, setSupportedLanguages] = useState(initialConfig.supportedLanguages.length > 0 ? initialConfig.supportedLanguages : ["en"])
  const [active, setActive] = useState(initialConfig.active)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const toggleGoal = (goal: string) => {
    if (goal === "all") {
      setGoals((current) => current.length === allGoalValues.length ? [] : allGoalValues)
      return
    }

    setGoals((current) => current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal])
  }

  const toggleLanguage = (language: string) => {
    setSupportedLanguages((current) => {
      if (current.includes(language)) {
        if (language === "en") {
          return current
        }

        return current.filter((item) => item !== language)
      }

      return [...current, language]
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    const response = await fetch("/api/agent/config", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agentName, welcomeMessage, tone, goals, supportedLanguages, active }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      setError(payload?.error ?? "Unable to save your AI agent right now.")
      setLoading(false)
      return
    }

    setMessage("AI agent saved.")
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Agent name</label>
          <input value={agentName} onChange={(event) => setAgentName(event.target.value)} className={inputClassName} />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Tone</label>
          <input value={tone} disabled className={`${inputClassName} cursor-not-allowed bg-slate-50 text-slate-500`} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Welcome message</label>
        <textarea value={welcomeMessage} onChange={(event) => setWelcomeMessage(event.target.value)} className={textareaClassName} />
      </div>

      <div className={sectionClassName}>
        <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#1d4ed8_0%,#06b6d4_100%)]" />
        <div className="pt-4">
          <p className="text-lg font-semibold text-slate-900">Primary Goals</p>
          <p className="mt-1 text-sm text-slate-500">Select what your AI agent should help shoppers accomplish</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              { value: "all", label: "All goals" },
              ...goalOptions,
            ].map((goal) => {
            const checked = goal.value === "all" ? goals.length === allGoalValues.length : goals.includes(goal.value)
            return (
              <label key={goal.value} className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${checked ? "border-[#4f46e5]/25 bg-[#eef2ff] text-slate-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                <input type="checkbox" checked={checked} onChange={() => toggleGoal(goal.value)} className="h-4 w-4 rounded border-slate-300 text-[#4f46e5] focus:ring-[#4f46e5]" />
                <span>{goal.label}</span>
              </label>
            )
          })}
          </div>
        </div>
      </div>

      <div className={sectionClassName}>
        <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#1d4ed8_0%,#06b6d4_100%)]" />
        <div className="pt-4">
          <p className="text-lg font-semibold text-slate-900">Supported Languages</p>
          <p className="mt-1 text-sm text-slate-500">The widget will show a language picker to shoppers. Your agent will respond in the chosen language.</p>
          <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {languageOptions.map((language) => (
              <label key={language.value} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <input type="checkbox" checked={supportedLanguages.includes(language.value)} onChange={() => toggleLanguage(language.value)} className="h-4 w-4 rounded border-slate-300 text-[#4f46e5] focus:ring-[#4f46e5]" />
                <span>{language.flag}</span>
                <span>{language.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-amber-200 bg-white shadow-[0_10px_25px_rgba(148,163,184,0.08)]">
        <div className="border-b border-amber-200 bg-amber-400/95 px-4 py-3 text-sm font-semibold text-amber-950">
          <ShieldAlert className="mr-2 inline h-4 w-4" />
          Financial Transaction Policy — Required
        </div>
        <div className="p-4 text-sm text-slate-700">
          <p className="mb-3">By saving, you agree that the Omniweb AI agent will:</p>
          <ul className="list-disc space-y-1 pl-5 text-slate-600">
            <li>Add products to the shopper&apos;s cart</li>
            <li>Send cart abandonment reminders</li>
            <li>NOT process checkouts or complete payments</li>
            <li>NOT issue refunds or access billing information</li>
            <li>NOT handle any financial transactions</li>
          </ul>
          <p className="mt-3 text-slate-500">Any financial request from a shopper will be immediately escalated to a human representative.</p>
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Keep this AI agent active for your workspace
      </label>

      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save and sync agent"}
      </button>
    </form>
  )
}
