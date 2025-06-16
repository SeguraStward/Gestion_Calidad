/** @type {import('next').NextConfig} */

// Next.js configuration
const nextConfig = {
  // Transpile specific packages
  transpilePackages: ['@una-gc/ui'],

  // Enable asset compression
  compress: true,

  // Set custom headers for caching optimization
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400'
          }
        ]
      }
    ]
  }
}

export default nextConfig
