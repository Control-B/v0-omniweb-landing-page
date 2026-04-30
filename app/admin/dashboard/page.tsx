import { redirect } from "next/navigation"

export type AdminPageId =
  | "overview"
  | "agents"
  | "sessions"
  | "clients"
  | "templates"
  | "team"
  | "client-detail"

export default function AdminDashboardPage() {
  redirect("/")
}
