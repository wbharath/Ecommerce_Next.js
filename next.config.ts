import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com'
      },
      {
        protocol: 'https',
        hostname: 'snfudmenffpcqsomcnjm.supabase.co'
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com'
      }
    ]
  },
  turbopack: {}
}

export default nextConfig
