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
  const page = getMarketingPage("company", slug)
  if (!page) return {}
  return { title: page.metaTitle, description: page.metaDescription }
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params
  if (slug === "book-demo") redirect("/demo")
  const page = getMarketingPage("company", slug)
  if (!page) notFound()
  return <CompanyPageTemplate content={page.content} />
}
