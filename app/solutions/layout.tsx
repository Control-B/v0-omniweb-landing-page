import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Solutions by Industry | Omniweb",
  description: "Discover Omniweb solutions for Shopify, contractors, real estate, healthcare, home services, ecommerce, professional services, roadside assistance, and agencies.",
}

export default function SolutionsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
