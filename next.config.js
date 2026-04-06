/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Native modules: avoid bundling into serverless chunks.
  serverExternalPackages: ['better-sqlite3', 'pg'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
  async redirects() {
    return []
  },
  async headers() {
    // In development, skip strict CSP/security headers. Chrome enforces CSP; embedded
    // IDE browsers often do not — so styles can appear in the IDE but look "unstyled"
    // in Chrome when Turbopack uses blob: or dev-only asset URLs that violate prod CSP.
    if (process.env.NODE_ENV === 'development') {
      return []
    }
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Clickjacking protection (belt + suspenders with CSP frame-ancestors)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Limit referrer info sent to third parties
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable unused browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // Content Security Policy
          // Note: Next.js requires 'unsafe-inline' for its runtime scripts and styles.
          // A nonce-based CSP would be stricter but needs middleware; this is a solid baseline.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: cdn.sanity.io",
              "font-src 'self' fonts.gstatic.com",
              "connect-src 'self' *.sanity.io api.sanity.io *.supabase.co",
              "frame-src 'self' *.sanity.io",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
