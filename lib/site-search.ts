import { createClient, type SanityClient } from '@sanity/client'
import { isSafeSiteHref, normalizeSearchQuery } from '@/lib/search-safety'
import { searchQueryTokens, searchStaticPages, type StaticSearchEntry } from '@/lib/site-search-static'

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || 'itqpjbjj'
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production'

export type SiteSearchHit = {
  title: string
  href: string
  snippet: string
  source: 'page' | 'sanity'
  /** Sanity document type when source === 'sanity' */
  docType?: string
}

const MAX_SANITY_TOKENS = 5

function sanityGlob(token: string): string {
  const safe = token.replace(/[*?"[\]]/g, '').slice(0, 64)
  if (!safe) return ''
  return `*${safe}*`
}

function getSearchClient(): SanityClient | null {
  try {
    return createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: '2024-01-01',
      useCdn: true,
    })
  } catch {
    return null
  }
}

function tokenMatchClause(fields: { path: string; optional?: boolean }[], tokenIndex: number): string {
  const p = `$p${tokenIndex}`
  const parts = fields.map((f) => {
    const base = `${f.path} match ${p}`
    return f.optional ? `(defined(${f.path}) && ${base})` : base
  })
  return `(${parts.join(' || ')})`
}

function buildMultiTokenFilter(
  type: string,
  fields: { path: string; optional?: boolean }[],
  tokenCount: number,
): string {
  const groups = Array.from({ length: tokenCount }, (_, i) => tokenMatchClause(fields, i))
  return `_type == "${type}" && ${groups.join(' && ')}`
}

type SanityHitRaw = {
  _type: string
  title?: string
  name?: string
  excerpt?: string
  achievement?: string
  speakerName?: string
  topic?: string
  description?: string
  shortDescription?: string
  role?: string
  bio?: string
  location?: string
  slug?: { current?: string }
}

function mapSanityRow(row: SanityHitRaw): SiteSearchHit | null {
  const slug = row.slug?.current

  switch (row._type) {
    case 'newsArticle':
      if (!row.title || !slug) return null
      return {
        title: row.title,
        href: `/news/${slug}`,
        snippet: row.excerpt?.slice(0, 220) || 'News article',
        source: 'sanity',
        docType: 'newsArticle',
      }
    case 'kudos':
      if (!row.name || !slug) return null
      return {
        title: row.name + (row.achievement ? ` — ${row.achievement}` : ''),
        href: `/kudos/${slug}`,
        snippet: row.excerpt?.slice(0, 220) || row.achievement || 'Kudos',
        source: 'sanity',
        docType: 'kudos',
      }
    case 'event':
      if (!row.title) return null
      return {
        title: row.title,
        href: '/calendar',
        snippet: [row.description, row.location].filter(Boolean).join(' · ').slice(0, 220) || 'Calendar event',
        source: 'sanity',
        docType: 'event',
      }
    case 'presentation':
      if (!row.title && !row.speakerName) return null
      return {
        title: row.topic || row.title || row.speakerName || 'Presentation',
        href: '/programs',
        snippet: [row.speakerName, row.topic].filter(Boolean).join(' — ').slice(0, 220) || 'Monthly aviation program',
        source: 'sanity',
        docType: 'presentation',
      }
    case 'page':
      if (!row.title || !slug) return null
      return {
        title: row.title,
        href: `/${slug}`,
        snippet: 'Chapter page',
        source: 'sanity',
        docType: 'page',
      }
    case 'storeProduct':
      if (!row.title) return null
      return {
        title: row.title,
        href: '/store',
        snippet: row.shortDescription?.slice(0, 220) || 'Store item',
        source: 'sanity',
        docType: 'storeProduct',
      }
    case 'boardMember':
      if (!row.name) return null
      return {
        title: `${row.name}${row.role ? ` — ${row.role}` : ''}`,
        href: '/chapter/board',
        snippet: row.bio?.slice(0, 220) || 'Board member',
        source: 'sanity',
        docType: 'boardMember',
      }
    default:
      return null
  }
}

async function searchSanity(tokens: string[]): Promise<SiteSearchHit[]> {
  if (tokens.length === 0) return []
  const tks = tokens.slice(0, MAX_SANITY_TOKENS).map(sanityGlob).filter(Boolean)
  if (tks.length === 0) return []

  const client = getSearchClient()
  if (!client) return []

  const params: Record<string, string> = {}
  tks.forEach((g, i) => {
    params[`p${i}`] = g
  })
  const n = tks.length

  const filters = [
    buildMultiTokenFilter('newsArticle', [{ path: 'title' }, { path: 'excerpt', optional: true }], n),
    buildMultiTokenFilter(
      'kudos',
      [{ path: 'name' }, { path: 'achievement', optional: true }, { path: 'excerpt', optional: true }],
      n,
    ),
    buildMultiTokenFilter(
      'event',
      [{ path: 'title' }, { path: 'description', optional: true }, { path: 'location', optional: true }],
      n,
    ),
    buildMultiTokenFilter(
      'presentation',
      [{ path: 'title' }, { path: 'speakerName', optional: true }, { path: 'topic', optional: true }],
      n,
    ),
    buildMultiTokenFilter('page', [{ path: 'title' }], n),
    buildMultiTokenFilter(
      'storeProduct',
      [{ path: 'title' }, { path: 'shortDescription', optional: true }],
      n,
    ),
    buildMultiTokenFilter('boardMember', [{ path: 'name' }, { path: 'role', optional: true }, { path: 'bio', optional: true }], n),
  ]

  const groq = `*[${filters.map((f) => `(${f})`).join(' || ')}][0...40]{
    _type,
    title,
    name,
    excerpt,
    achievement,
    speakerName,
    topic,
    description,
    shortDescription,
    role,
    bio,
    location,
    slug
  }`

  try {
    const rows = await client.fetch<SanityHitRaw[]>(groq, params)
    const hits: SiteSearchHit[] = []
    const seenKey = new Set<string>()
    for (const row of rows) {
      const mapped = mapSanityRow(row)
      if (!mapped) continue
      const key = `${mapped.docType}:${mapped.href}:${mapped.title}`
      if (seenKey.has(key)) continue
      seenKey.add(key)
      hits.push(mapped)
    }
    return hits
  } catch {
    return []
  }
}

function staticToHit(e: StaticSearchEntry): SiteSearchHit {
  return {
    title: e.title,
    href: e.href,
    snippet: e.snippet,
    source: 'page',
  }
}

/**
 * Site-wide search: keyword match over curated static routes + Sanity documents (when reachable).
 */
export async function runSiteSearch(query: string): Promise<SiteSearchHit[]> {
  const q = normalizeSearchQuery(query)
  if (!q) return []

  const staticHits = searchStaticPages(q, 30).map(staticToHit)
  const tokens = searchQueryTokens(q)

  let cmsHits: SiteSearchHit[] = []
  if (tokens.length > 0) {
    cmsHits = await searchSanity(tokens)
  }

  const seen = new Set<string>()
  const out: SiteSearchHit[] = []

  const push = (h: SiteSearchHit) => {
    if (!isSafeSiteHref(h.href)) return
    const key = `${h.href}::${h.title}`
    if (seen.has(key)) return
    seen.add(key)
    out.push(h)
  }

  for (const h of staticHits) push(h)
  for (const h of cmsHits) push(h)

  return out.slice(0, 50)
}
