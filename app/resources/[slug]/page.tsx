import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ResourcePageTemplate } from "@/components/marketing/marketing-page-template"
import { getMarketingPage, getMarketingStaticParams } from "@/lib/marketing-pages"

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getMarketingStaticParams("resources")
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getMarketingPage("resources", slug)
  if (!page) return {}
  return { title: page.metaTitle, description: page.metaDescription }
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const page = getMarketingPage("resources", slug)
  if (!page) notFound()
  return <ResourcePageTemplate content={page.content} />
}
