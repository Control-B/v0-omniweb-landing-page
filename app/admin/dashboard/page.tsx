"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminOverview } from "@/components/admin/overview"
import { AdminClients } from "@/components/admin/clients"
import { AdminTemplates } from "@/components/admin/templates"
import { AdminClientDetail } from "@/components/admin/client-detail"
import { AdminAgents } from "@/components/admin/agents"
import { AdminConversations } from "@/components/admin/conversations"
import { AdminTeam } from "@/components/admin/team"

export type AdminPageId =
  | "overview"
  | "agents"
  | "sessions"
  | "clients"
  | "templates"
  | "team"
  | "client-detail"

export default function AdminDashboardPage() {
  const [activePage, setActivePage] = useState<AdminPageId>("overview")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  function handleViewClient(clientId: string) {
    setSelectedClientId(clientId)
    setActivePage("client-detail")
  }

  function handleBackToClients() {
    setSelectedClientId(null)
    setActivePage("clients")
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[#050a12] text-white">
      <AdminSidebar
        activePage={activePage}
        onNavigate={(p) => {
          setActivePage(p)
          setSelectedClientId(null)
        }}
      />
      <main className="flex-1 overflow-y-auto">
        {activePage === "overview" && <AdminOverview />}
        {activePage === "agents" && <AdminAgents />}
        {activePage === "sessions" && <AdminConversations />}
        {activePage === "clients" && (
          <AdminClients onViewClient={handleViewClient} />
        )}
        {activePage === "templates" && <AdminTemplates />}
        {activePage === "team" && <AdminTeam />}
        {activePage === "client-detail" && selectedClientId && (
          <AdminClientDetail
            clientId={selectedClientId}
            onBack={handleBackToClients}
          />
        )}
      </main>
    </div>
  )
}
