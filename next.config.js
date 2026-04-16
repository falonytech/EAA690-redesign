/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Expose deployment target to the browser for client-side MFA enrollment checks (AuthGuard).
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || '',
  },
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
          // Disable unused browser features; allow payment= for Stripe Payment Request API
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self "js.stripe.com")',
          },
          // Content Security Policy
          // Note: Next.js requires 'unsafe-inline' for its runtime scripts and styles.
          // A nonce-based CSP would be stricter but needs middleware; this is a solid baseline.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: cdn.sanity.io *.stripe.com",
              "font-src 'self' fonts.gstatic.com",
              // Stripe Checkout redirect is same-tab navigation (no fetch needed), but
              // Stripe.js (if added later) needs connect-src; include now for forward compat.
              "connect-src 'self' *.sanity.io api.sanity.io *.supabase.co api.stripe.com",
              "frame-src 'self' *.sanity.io js.stripe.com hooks.stripe.com www.youtube-nocookie.com player.vimeo.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              // checkout.stripe.com redirect is a GET, not a form POST — 'self' is sufficient
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
