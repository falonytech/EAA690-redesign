import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to override any Vercel-level redirects
 * This ensures /login stays on our site and doesn't redirect to Squarespace
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Explicitly handle /login and /sign-in to prevent any external redirects
  if (pathname === '/login' || pathname === '/sign-in') {
    // Allow the request to proceed to our Next.js login page
    return NextResponse.next()
  }

  // For all other routes, proceed normally
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and typical static assets.
     * Exclude the full `/_next` prefix (not only `_next/static`) so dev chunks,
     * HMR, and CSS never pass through middleware — mis-matched middleware here
     * can break styles on some routes in development.
     */
    '/((?!api|_next|favicon.ico|.*\\..*).*)',
  ],
}

