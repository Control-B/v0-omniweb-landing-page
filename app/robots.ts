import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/api/', '/sso-callback'],
      },
    ],
    sitemap: 'https://omniweb.ai/sitemap.xml',
  }
}
