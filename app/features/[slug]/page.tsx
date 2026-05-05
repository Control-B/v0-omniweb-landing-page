import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FeaturePageTemplate } from "@/components/marketing/marketing-page-template"
import { getMarketingPage, getMarketingStaticParams } from "@/lib/marketing-pages"

type PageProps = { params: { slug: string } }

export function generateStaticParams() {
  return getMarketingStaticParams("features")
}

export function generateMetadata({ params }: PageProps): Metadata {
  const page = getMarketingPage("features", params.slug)
  if (!page) return {}
  return { title: page.metaTitle, description: page.metaDescription }
}

export default function FeatureDetailPage({ params }: PageProps) {
  const page = getMarketingPage("features", params.slug)
  if (!page) notFound()
  return <FeaturePageTemplate content={page.content} />
}
