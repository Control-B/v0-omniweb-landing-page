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
}

export default nextConfig
