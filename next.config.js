/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      'localhost',
      'res.cloudinary.com' // Add Cloudinary domain for production image hosting
    ]
  },
  // Optimize for production
  swcMinify: true,
  // Enable static optimization where possible
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react']
  },
  // Configure powered by header
  poweredByHeader: false,
  // Enable React strict mode for better development
  reactStrictMode: true,
  // Configure output for better performance
  output: 'standalone',
  // Disable x-powered-by header
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig