"use client"

import { useState } from "react"
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function CallCenterRoiCalculator() {
  const [seats, setSeats] = useState(25)
  const [callsPerDay, setCallsPerDay] = useState(80)
  const [avgDurationMins, setAvgDurationMins] = useState(3.5)

  // Human Call Center Cost: $3,500 salary + $700 benefits/seat = $4,200 / month
  const humanMonthlyCost = seats * 4200

  // Omniweb AI Swarm Cost: $0.09 / minute + $299 platform fee
  const totalMonthlyMinutes = seats * callsPerDay * avgDurationMins * 22 // 22 working days
  const omniwebMonthlyCost = Math.round(totalMonthlyMinutes * 0.09 + 299)

  const monthlySavings = humanMonthlyCost - omniwebMonthlyCost
  const annualSavings = monthlySavings * 12
  const percentageSavings = Math.round((monthlySavings / humanMonthlyCost) * 100)

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-slate-950/95 to-[#081020]/95 p-3.5 sm:p-6 lg:p-10 shadow-2xl backdrop-blur-2xl">
      <div className="mx-auto max-w-3xl text-center px-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
          <Calculator className="h-3.5 w-3.5" />
          Autonomous Contact Center ROI
        </div>
        <h3 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white break-words">
          Calculate Your Contact Center Cost Reduction
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Compare traditional human call center staffing costs with Omniweb's 24/7 Autonomous Agentic Swarms.
        </p>
      </div>

      <div className="mt-8 sm:mt-10 grid gap-6 sm:gap-8 lg:grid-cols-12 lg:items-center w-full min-w-0 max-w-full">
        {/* Sliders Input Column (6 cols) */}
        <div className="w-full min-w-0 max-w-full space-y-6 lg:col-span-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/60 p-3.5 sm:p-6 overflow-hidden">
          <div className="w-full min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs sm:text-sm">
              <span className="font-semibold text-white">Human Agent Seats Replaced</span>
              <span className="font-mono font-bold text-cyan-400 text-sm sm:text-base">{seats} Agents</span>
            </div>
            <input
              type="range"
              min={2}
              max={150}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="mt-3 w-full max-w-full accent-cyan-400 cursor-pointer block"
            />
            <div className="mt-1 flex justify-between text-[10px] sm:text-[11px] text-slate-500">
              <span>2 seats</span>
              <span>50 seats</span>
              <span>150 seats</span>
            </div>
          </div>

          <div className="w-full min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs sm:text-sm">
              <span className="font-semibold text-white">Daily Calls Per Agent</span>
              <span className="font-mono font-bold text-purple-400 text-sm sm:text-base">{callsPerDay} Calls</span>
            </div>
            <input
              type="range"
              min={20}
              max={150}
              value={callsPerDay}
              onChange={(e) => setCallsPerDay(Number(e.target.value))}
              className="mt-3 w-full max-w-full accent-purple-400 cursor-pointer block"
            />
          </div>

          <div className="w-full min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs sm:text-sm">
              <span className="font-semibold text-white">Average Call Duration</span>
              <span className="font-mono font-bold text-amber-400 text-sm sm:text-base">{avgDurationMins} Minutes</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={avgDurationMins}
              onChange={(e) => setAvgDurationMins(Number(e.target.value))}
              className="mt-3 w-full max-w-full accent-amber-400 cursor-pointer block"
            />
          </div>

          <div className="rounded-2xl border border-white/5 bg-black/30 p-3 sm:p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Includes 24/7/365 After-Hours & Weekend Coverage</span>
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Zero Hold Times & Instant Scalability to 500 Concurrency</span>
            </div>
          </div>
        </div>

        {/* Calculated Output Card (6 cols) */}
        <div className="w-full min-w-0 max-w-full lg:col-span-6 rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-950/90 to-cyan-950/40 p-4 sm:p-8 shadow-2xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Projected Savings</span>
            <Badge className="bg-emerald-500 text-black font-bold text-xs">{percentageSavings}% Cost Cut</Badge>
          </div>

          <div className="mt-5 w-full min-w-0">
            <span className="text-xs text-slate-400">Monthly Net Savings</span>
            <div className="mt-1 flex flex-wrap items-baseline gap-1.5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white break-words">
              <span>${monthlySavings.toLocaleString()}</span>
              <span className="text-sm sm:text-base lg:text-lg font-normal text-emerald-400">/ month</span>
            </div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-emerald-300 break-words">
              ${annualSavings.toLocaleString()} in annual operational savings
            </div>
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 border-t border-white/10 pt-5 sm:pt-6 text-xs w-full min-w-0">
            <div className="rounded-xl border border-white/5 bg-black/40 p-3 min-w-0">
              <span className="text-slate-400 font-semibold uppercase text-[10px] sm:text-xs">Human Call Center</span>
              <p className="mt-1 text-sm sm:text-base font-bold text-rose-400 break-words">${humanMonthlyCost.toLocaleString()}/mo</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 min-w-0">
              <span className="text-emerald-400 font-semibold uppercase text-[10px] sm:text-xs">Omniweb AI Swarm</span>
              <p className="mt-1 text-sm sm:text-base font-bold text-emerald-300 break-words">${omniwebMonthlyCost.toLocaleString()}/mo</p>
            </div>
          </div>

          <Button
            asChild
            size="lg"
            className="mt-6 w-full max-w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold text-black hover:from-emerald-400 hover:to-cyan-400 h-auto py-3.5 px-4 whitespace-normal text-center"
          >
            <Link href="/get-started" className="flex items-center justify-center gap-2">
              <span className="text-xs sm:text-sm">Deploy Your Autonomous Contact Center</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
