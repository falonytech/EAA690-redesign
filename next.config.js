/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Native modules: avoid bundling better-sqlite3 into serverless chunks (Postgres-only on Vercel).
  serverExternalPackages: ['better-sqlite3', 'pg'],
  async redirects() {
    return [
      // Ensure /login stays on our site and doesn't redirect to Squarespace
      // This overrides any Vercel-level redirects
    ]
  },
}

module.exports = nextConfig

