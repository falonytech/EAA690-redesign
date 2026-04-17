import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getAuth } from '@/lib/better-auth'

/**
 * Admin-only database connectivity probe.
 *
 * SECURITY: Previously this route was unauthenticated and exposed:
 *   - the database URL prefix and structure (host/pooler/port info),
 *   - the Postgres server version banner,
 *   - whether the `user` table exists,
 *   - rich connection error details (code/detail/hint/stack).
 * That is information disclosure that materially helps an attacker (OWASP A05:
 * Security Misconfiguration). It is now restricted to admins and the response
 * is reduced to a minimal `ok / not-ok` for production use.
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

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return NextResponse.json({ ok: false, error: 'DATABASE_URL not set' }, { status: 503 })
  }

  let pool: Pool | null = null
  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10_000,
      max: 1,
    })
    await pool.query('SELECT 1')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('test-db error:', error)
    return NextResponse.json({ ok: false, error: 'Database connection failed' }, { status: 500 })
  } finally {
    if (pool) await pool.end().catch(() => {})
  }
}
