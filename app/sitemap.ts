import type { MetadataRoute } from 'next'
import { getAllMarketingRoutes } from '@/lib/marketing-pages'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://omniweb.ai'
  const now = new Date()

  const marketingRoutes = getAllMarketingRoutes()
  const staticRoutes = [
    "/templates",
    "/signin",
    "/terms",
    "/privacy",
  ]

  const routes = Array.from(new Set([
    ...marketingRoutes,
    ...staticRoutes,
  ]))

  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly' as const, priority: 1.0 },
    ...routes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: route === '/' ? 1.0 : route.split('/').length <= 2 ? 0.9 : 0.7,
    })),

    { url: `${baseUrl}/templates`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/signin`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.2 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.2 },
  ]

}
