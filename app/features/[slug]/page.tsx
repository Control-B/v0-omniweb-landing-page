import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FeaturePageTemplate } from "@/components/marketing/marketing-page-template"
import { getMarketingPage, getMarketingStaticParams } from "@/lib/marketing-pages"

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getMarketingStaticParams("features")
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getMarketingPage("features", slug)
  if (!page) return {}
  return { title: page.metaTitle, description: page.metaDescription }
}

export default async function FeatureDetailPage({ params }: PageProps) {
  const { slug } = await params
  const page = getMarketingPage("features", slug)
  if (!page) notFound()
  return <FeaturePageTemplate content={page.content} />
}
