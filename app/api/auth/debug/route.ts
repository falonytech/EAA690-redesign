import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/better-auth'

/**
 * Admin-only Better Auth diagnostic.
 *
 * SECURITY: Previously this route was unauthenticated and reported the resolved
 * `BETTER_AUTH_URL`, the `VERCEL_URL` value, and which env vars were "set" vs
 * "not set". That gives any visitor a roadmap to your deploy topology and
 * accelerates baseURL/CSRF probing (OWASP A05: Security Misconfiguration).
 *
 * Access is now restricted to admin sessions, and we only report whether the
 * resolved baseURL matches the request origin (the actual debug signal we use)
 * — not the underlying env values.
 */
async function requireAdmin(request: NextRequest): Promise<true | NextResponse> {
  const session = await getAuth().api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin role required' }, { status: 403 })
  }
  return true
}

export async function GET(request: NextRequest) {
  const check = await requireAdmin(request)
  if (check !== true) return check

  try {
    const url = new URL(request.url)
    const origin = request.headers.get('origin') || url.origin

    const baseURL =
      process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const matches = baseURL === origin

    return NextResponse.json({
      ok: matches,
      requestOrigin: origin,
      betterAuthBaseURL: baseURL,
      message: matches
        ? 'Better Auth baseURL matches the request origin.'
        : 'Better Auth baseURL does not match the request origin — sign-in CSRF/403s are likely. Set BETTER_AUTH_URL to match the deployed origin.',
    })
  } catch (error) {
    console.error('auth/debug error:', error)
    return NextResponse.json({ error: 'Failed to read auth diagnostic' }, { status: 500 })
  }
}
