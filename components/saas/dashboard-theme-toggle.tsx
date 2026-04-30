"use client"

import { MonitorCog, MoonStar, SunMedium } from "lucide-react"
import { useTheme } from "next-themes"

const options = [
  { value: "default", label: "Default", icon: MonitorCog },
  { value: "light", label: "Light", icon: SunMedium },
  { value: "dark", label: "Dark", icon: MoonStar },
] as const

export function DashboardThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const activeTheme = resolvedTheme === "light" || resolvedTheme === "dark" ? resolvedTheme : "default"

  return (
    <div className="rounded-[1.25rem] border border-slate-200/80 p-2">
      <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Theme</p>
      <div className="grid gap-1">
        {options.map((option) => {
          const active = activeTheme === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`}
            >
              <option.icon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-sky-500"}`} />
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}