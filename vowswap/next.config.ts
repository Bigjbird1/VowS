import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    domains: ['placeholder.jpg'], // Add your image domains here
    minimumCacheTTL: 60,
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  swcMinify: true,
  experimental: {
    optimizeCss: {
      enabled: true
    },
    serverActions: {
      bodySizeLimit: '2mb'
    },
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
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
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
        }
      ]
    }
  ],
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true
      }
    ];
  }
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
