"use client"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { AdminPageId } from "@/app/admin/dashboard/page"
import {
  BarChart3,
  Users,
  FileText,
  ChevronLeft,
  LogOut,
  Shield,
  Bot,
  MessageSquare,
  UserCog,
} from "lucide-react"
import { useState } from "react"
import { OmniwebLogo, OmniwebMark } from "@/components/brand-logo"

const NAV_ITEMS: { id: AdminPageId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "sessions", label: "Sessions", icon: MessageSquare },
  { id: "clients", label: "Clients", icon: Users },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "team", label: "Team", icon: UserCog },
]

interface AdminSidebarProps {
  activePage: AdminPageId
  onNavigate: (page: AdminPageId) => void
}

export function AdminSidebar({ activePage, onNavigate }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/admin")
  }

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-white/10 bg-[#080e1a] transition-all duration-200",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        {collapsed ? (
          <OmniwebMark className="h-9 w-9 rounded-lg" />
        ) : (
          <OmniwebLogo href="/admin" textClassName="text-sm font-semibold text-cyan-200" sublabel="admin panel" sublabelClassName="text-[11px] text-slate-400" />
        )}
      </div>

      {/* Admin badge */}
      {!collapsed && (
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-indigo-400 font-medium">
                Administrator
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-1 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            activePage === item.id ||
            (item.id === "clients" && activePage === "client-detail")
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon
                className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-indigo-400")}
              />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-white/10 space-y-0.5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft
            className={cn("w-[18px] h-[18px] transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
