import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ResourcePageTemplate } from "@/components/marketing/marketing-page-template"
import { getMarketingPage, getMarketingStaticParams } from "@/lib/marketing-pages"

type PageProps = { params: { slug: string } }

export function generateStaticParams() {
  return getMarketingStaticParams("resources")
}

export function generateMetadata({ params }: PageProps): Metadata {
  const page = getMarketingPage("resources", params.slug)
  if (!page) return {}
  return { title: page.metaTitle, description: page.metaDescription }
}

export default function ResourceDetailPage({ params }: PageProps) {
  const page = getMarketingPage("resources", params.slug)
  if (!page) notFound()
  return <ResourcePageTemplate content={page.content} />
}
