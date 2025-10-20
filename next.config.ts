import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com'
      },
      {
        protocol: 'https',
        hostname: 'droekacvqmjmpnnwzttj.supabase.co'
      }
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback
    }

    // Allow default imports for SWR
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx']
    }

    return config
  },
  transpilePackages: ['@clerk/clerk-react', '@clerk/shared']
}

export default nextConfig
