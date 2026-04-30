"use client"

import { useState } from "react"

type AgentConfigFormProps = {
  initialConfig: {
    agentName: string
    welcomeMessage: string
    tone: "professional"
    goals: string[]
    active: boolean
  }
}

const availableGoals = [
  "lead_qualification",
  "customer_support",
  "sales_assistance",
]

const inputClassName = "mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
const textareaClassName = "mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"

export function AgentConfigForm({ initialConfig }: AgentConfigFormProps) {
  const [agentName, setAgentName] = useState(initialConfig.agentName)
  const [welcomeMessage, setWelcomeMessage] = useState(initialConfig.welcomeMessage)
  const [tone] = useState(initialConfig.tone)
  const [goals, setGoals] = useState(initialConfig.goals)
  const [active, setActive] = useState(initialConfig.active)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const toggleGoal = (goal: string) => {
    setGoals((current) => current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal])
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
      body: JSON.stringify({ agentName, welcomeMessage, tone, goals, active }),
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

      <div>
        <p className="text-sm font-medium text-slate-700">Goals</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {availableGoals.map((goal) => {
            const checked = goals.includes(goal)
            return (
              <label key={goal} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${checked ? "border-blue-200 bg-blue-50 text-slate-900" : "border-slate-200 bg-white text-slate-600"}`}>
                <input type="checkbox" checked={checked} onChange={() => toggleGoal(goal)} />
                <span>{goal.replace(/_/g, " ")}</span>
              </label>
            )
          })}
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
        className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-6 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(59,130,246,0.25)] transition hover:from-cyan-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save AI agent"}
      </button>
    </form>
  )
}
