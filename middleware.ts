import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to override any Vercel-level redirects
 * This ensures /login stays on our site and doesn't redirect to Squarespace
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Never run custom logic on Next.js internals (CSS, JS, HMR, fonts, etc.).
  // Defensive guard — matcher should already skip these, but this avoids edge cases
  // where middleware could run on /_next/* and break styles in dev.
  if (pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  if (pathname === '/login' || pathname === '/sign-in') {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
