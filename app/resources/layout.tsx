import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Omniweb Resources, Docs, Case Studies & Guides",
  description: "Browse Omniweb blogs, case studies, docs, integrations, security information, API guidance, and step-by-step rollout guides.",
}

export default function ResourcesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
