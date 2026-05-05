import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Omniweb Pricing Plans for Voice, Chat, Telephony & Enterprise",
  description: "Compare Omniweb pricing for voice agents, chat assistants, AI telephony, combo plans, Shopify, agencies, and enterprise deployments.",
}

export default function PricingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
