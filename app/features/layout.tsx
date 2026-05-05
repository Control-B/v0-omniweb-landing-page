import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Features for Voice, Chat, Automation | Omniweb",
  description: "Explore Omniweb features for AI voice agents, chat assistants, multilingual support, scheduling, CRM sync, analytics, and workflow automation.",
}

export default function FeaturesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
