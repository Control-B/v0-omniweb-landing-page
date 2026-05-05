import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PricingPageTemplate } from "@/components/marketing/marketing-page-template"
import { getMarketingPage, getMarketingStaticParams } from "@/lib/marketing-pages"

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getMarketingStaticParams("pricing")
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getMarketingPage("pricing", slug)
  if (!page) return {}
  return { title: page.metaTitle, description: page.metaDescription }
}

export default async function PricingDetailPage({ params }: PageProps) {
  const { slug } = await params
  const page = getMarketingPage("pricing", slug)
  if (!page) notFound()
  return <PricingPageTemplate content={page.content} />
}
