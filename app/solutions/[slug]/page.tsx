import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SolutionPageTemplate } from "@/components/marketing/marketing-page-template"
import { getMarketingPage, getMarketingStaticParams } from "@/lib/marketing-pages"

type PageProps = { params: { slug: string } }

export function generateStaticParams() {
  return getMarketingStaticParams("solutions")
}

export function generateMetadata({ params }: PageProps): Metadata {
  const page = getMarketingPage("solutions", params.slug)
  if (!page) return {}
  return { title: page.metaTitle, description: page.metaDescription }
}

export default function SolutionDetailPage({ params }: PageProps) {
  const page = getMarketingPage("solutions", params.slug)
  if (!page) notFound()
  return <SolutionPageTemplate content={page.content} />
}
