import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { redirect } from "next/navigation"
import { CompanyPageTemplate } from "@/components/marketing/marketing-page-template"
import { getMarketingPage, getMarketingStaticParams } from "@/lib/marketing-pages"

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getMarketingStaticParams("company")
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (slug === "book-demo") return { title: "Live AI Demo | Omniweb AI" }
  if (slug === "privacy") return { title: "Privacy Policy | Omniweb AI" }
  if (slug === "terms") return { title: "Terms of Service | Omniweb AI" }
  const page = getMarketingPage("company", slug)
  if (!page) return {}
  return { title: page.metaTitle, description: page.metaDescription }
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params
  if (slug === "book-demo") redirect("/demo")
  if (slug === "privacy") redirect("/privacy")
  if (slug === "terms") redirect("/terms")
  const page = getMarketingPage("company", slug)
  if (!page) notFound()
  return <CompanyPageTemplate content={page.content} />
}
