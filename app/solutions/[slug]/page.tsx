import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SolutionPageTemplate } from "@/components/marketing/marketing-page-template"
import { getMarketingPage, getMarketingStaticParams } from "@/lib/marketing-pages"

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getMarketingStaticParams("solutions")
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getMarketingPage("solutions", slug)
  if (!page) return {}
  return { title: page.metaTitle, description: page.metaDescription }
}

export default async function SolutionDetailPage({ params }: PageProps) {
  const { slug } = await params
  const page = getMarketingPage("solutions", slug)
  if (!page) notFound()
  return <SolutionPageTemplate content={page.content} />
}
