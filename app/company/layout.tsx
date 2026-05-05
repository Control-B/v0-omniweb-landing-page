import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About, Contact & Company Information | Omniweb",
  description: "Learn about Omniweb, contact the team, try the live AI demo, review partners and careers, and read privacy, terms, and status information.",
}

export default function CompanyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
