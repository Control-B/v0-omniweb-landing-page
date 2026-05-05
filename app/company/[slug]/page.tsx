import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CompanyPageTemplate } from "@/components/marketing/marketing-page-template"
import { getMarketingPage, getMarketingStaticParams } from "@/lib/marketing-pages"

type PageProps = { params: { slug: string } }

export function generateStaticParams() {
  return getMarketingStaticParams("company")
}

export function generateMetadata({ params }: PageProps): Metadata {
  const page = getMarketingPage("company", params.slug)
  if (!page) return {}
  return { title: page.metaTitle, description: page.metaDescription }
}

export default function CompanyDetailPage({ params }: PageProps) {
  const page = getMarketingPage("company", params.slug)
  if (!page) notFound()
  return <CompanyPageTemplate content={page.content} />
}
