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
  turbopack: {},
  transpilePackages: ['@clerk/clerk-react', '@clerk/shared']
}

export default nextConfig
