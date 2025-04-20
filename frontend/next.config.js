/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Disable static generation for routes that use authentication
  output: 'standalone',
  experimental: {
    // These authenticated routes should always be dynamic
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Added from next.config.mjs
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
