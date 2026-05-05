import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PricingPageTemplate } from "@/components/marketing/marketing-page-template"
import { getMarketingPage, getMarketingStaticParams } from "@/lib/marketing-pages"

type PageProps = { params: { slug: string } }

export function generateStaticParams() {
  return getMarketingStaticParams("pricing")
}

export function generateMetadata({ params }: PageProps): Metadata {
  const page = getMarketingPage("pricing", params.slug)
  if (!page) return {}
  return { title: page.metaTitle, description: page.metaDescription }
}

export default function PricingDetailPage({ params }: PageProps) {
  const page = getMarketingPage("pricing", params.slug)
  if (!page) notFound()
  return <PricingPageTemplate content={page.content} />
}
