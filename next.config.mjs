/** @type {import('next').NextConfig} */
const cdnOrigin = process.env.NEXT_PUBLIC_CDN_ORIGIN

const remotePatterns = []

if (cdnOrigin) {
  try {
    const url = new URL(cdnOrigin)
    remotePatterns.push({
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      pathname: '/**',
    })
  } catch {
  }
}

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns,
  },
  async headers() {
    return [
      {
        // Allow the embeddable widget to be loaded in iframes on any domain
        source: '/widget/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
        ],
      },
    ]
  },
}

export default nextConfig
