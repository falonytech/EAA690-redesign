import { runSiteSearch } from '@/lib/site-search'
import { normalizeSearchQuery } from '@/lib/search-safety'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('q') ?? ''
  const q = normalizeSearchQuery(raw)
  if (!q) {
    return NextResponse.json(
      { q: '', results: [] },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'private, no-store',
        },
      },
    )
  }
  const results = await runSiteSearch(q)
  const publicResults = results.map(({ title, href, snippet }) => ({ title, href, snippet }))
  return NextResponse.json(
    { q, results: publicResults },
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    },
  )
}
