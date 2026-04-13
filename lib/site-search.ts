import { createClient, type SanityClient } from '@sanity/client'
import { isSafeSiteHref, normalizeSearchQuery } from '@/lib/search-safety'
import {
  normalizeSearchHaystack,
  searchQueryTokens,
  searchStaticPages,
  type StaticSearchEntry,
} from '@/lib/site-search-static'

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
const SANITY_FETCH_LIMIT = 80

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

/** Single field in a GROQ `match` clause (parameterized; no user-controlled GROQ fragments). */
type GroqMatchField = {
  path: string
  optional?: boolean
  /** Use for e.g. `pt::text(content)` — check `defined(content)` not `defined(pt::text(...))`. */
  definedPath?: string
}

function fieldMatchLine(f: GroqMatchField, tokenIndex: number): string {
  const p = `$p${tokenIndex}`
  const base = `${f.path} match ${p}`
  if (!f.optional) return base
  const def = f.definedPath ?? f.path
  return `defined(${def}) && ${base}`
}

/** One query token matches if any of the fields match (OR). */
function oneTokenAnyField(fields: GroqMatchField[], tokenIndex: number): string {
  const parts = fields.map((f) => fieldMatchLine(f, tokenIndex))
  return `(${parts.join(' || ')})`
}

/**
 * Relaxed filter: document matches if ANY token matches ANY field (good recall).
 * Results are ranked in TypeScript by how many distinct tokens appear in a normalized haystack.
 */
function buildRelaxedTypeFilter(type: string, fields: GroqMatchField[], tokenCount: number): string {
  const groups = Array.from({ length: tokenCount }, (_, i) => oneTokenAnyField(fields, i))
  return `_type == "${type}" && (${groups.join(' || ')})`
}

const F_NEWS: GroqMatchField[] = [
  { path: 'title' },
  { path: 'excerpt', optional: true },
  { path: 'pt::text(content)', optional: true, definedPath: 'content' },
]

const F_KUDOS: GroqMatchField[] = [
  { path: 'name' },
  { path: 'achievement', optional: true },
  { path: 'excerpt', optional: true },
  { path: 'pt::text(content)', optional: true, definedPath: 'content' },
]

const F_EVENT: GroqMatchField[] = [
  { path: 'title' },
  { path: 'description', optional: true },
  { path: 'location', optional: true },
  { path: 'pt::text(content)', optional: true, definedPath: 'content' },
]

const F_PRESENTATION: GroqMatchField[] = [
  { path: 'title' },
  { path: 'speakerName', optional: true },
  { path: 'topic', optional: true },
  { path: 'speakerBio', optional: true },
]

const F_PAGE: GroqMatchField[] = [
  { path: 'title' },
  { path: 'pt::text(content)', optional: true, definedPath: 'content' },
]

const F_HOME: GroqMatchField[] = [
  { path: 'heroHeadline' },
  { path: 'programsSectionTitle', optional: true },
  { path: 'programsSectionSubtitle', optional: true },
  { path: 'pancakeTitle', optional: true },
  { path: 'pancakeIntro', optional: true },
  { path: 'spotlightTitle', optional: true },
  { path: 'spotlightSubtitle', optional: true },
  { path: 'pt::text(heroIntro)', optional: true, definedPath: 'heroIntro' },
  { path: 'pt::text(spotlightBody)', optional: true, definedPath: 'spotlightBody' },
]

const F_NEWSLETTER_ISSUE: GroqMatchField[] = [
  { path: 'title' },
  { path: 'volumeLabel', optional: true },
  { path: 'excerpt', optional: true },
  { path: 'pt::text(content)', optional: true, definedPath: 'content' },
]

const F_STORE: GroqMatchField[] = [
  { path: 'title' },
  { path: 'shortDescription', optional: true },
]

const F_BOARD: GroqMatchField[] = [
  { path: 'name' },
  { path: 'role', optional: true },
  { path: 'bio', optional: true },
]

type SanityHitRaw = {
  _type: string
  title?: string
  heroHeadline?: string
  programsSectionTitle?: string
  programsSectionSubtitle?: string
  pancakeTitle?: string
  pancakeIntro?: string
  spotlightTitle?: string
  spotlightSubtitle?: string
  name?: string
  volumeLabel?: string
  excerpt?: string
  achievement?: string
  speakerName?: string
  topic?: string
  description?: string
  shortDescription?: string
  role?: string
  bio?: string
  location?: string
  speakerBio?: string
  /** Plain text from portable `content` (GROQ projection). */
  contentText?: string
  slug?: { current?: string }
}

function rankTextForRow(row: SanityHitRaw): string {
  return [
    row.title,
    row.heroHeadline,
    row.programsSectionTitle,
    row.programsSectionSubtitle,
    row.pancakeTitle,
    row.pancakeIntro,
    row.spotlightTitle,
    row.spotlightSubtitle,
    row.name,
    row.volumeLabel,
    row.excerpt,
    row.achievement,
    row.speakerName,
    row.topic,
    row.description,
    row.shortDescription,
    row.role,
    row.bio,
    row.location,
    row.speakerBio,
    row.contentText,
  ]
    .filter((x): x is string => typeof x === 'string' && x.length > 0)
    .join(' ')
}

function countTokenMatches(haystackNorm: string, tokens: string[]): number {
  let n = 0
  for (const t of tokens) {
    if (t.length < 2) continue
    if (haystackNorm.includes(t)) n++
  }
  return n
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
    case 'newsletterIssue':
      if (!row.title || !slug) return null
      return {
        title: row.volumeLabel ? `${row.title} (${row.volumeLabel})` : row.title,
        href: `/newsletter/${slug}`,
        snippet: row.excerpt?.slice(0, 220) || 'NAVCOM newsletter issue',
        source: 'sanity',
        docType: 'newsletterIssue',
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
        snippet: [row.speakerName, row.topic, row.speakerBio?.slice(0, 120)]
          .filter(Boolean)
          .join(' — ')
          .slice(0, 220) || 'Monthly aviation program',
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
    case 'homePage':
      if (!row.heroHeadline) return null
      return {
        title: 'Home',
        href: '/',
        snippet:
          row.programsSectionSubtitle?.slice(0, 220) ||
          row.heroHeadline.slice(0, 220) ||
          'EAA Chapter 690 home page',
        source: 'sanity',
        docType: 'homePage',
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
  const rankingTokens = tokens.slice(0, MAX_SANITY_TOKENS)
  if (rankingTokens.length === 0) return []

  const tks = rankingTokens.map(sanityGlob).filter(Boolean)
  if (tks.length === 0) return []

  const client = getSearchClient()
  if (!client) return []

  const params: Record<string, string> = {}
  tks.forEach((g, i) => {
    params[`p${i}`] = g
  })
  const n = tks.length

  const filters = [
    buildRelaxedTypeFilter('newsArticle', F_NEWS, n),
    buildRelaxedTypeFilter('kudos', F_KUDOS, n),
    buildRelaxedTypeFilter('event', F_EVENT, n),
    buildRelaxedTypeFilter('presentation', F_PRESENTATION, n),
    buildRelaxedTypeFilter('page', F_PAGE, n),
    buildRelaxedTypeFilter('homePage', F_HOME, n),
    buildRelaxedTypeFilter('newsletterIssue', F_NEWSLETTER_ISSUE, n),
    buildRelaxedTypeFilter('storeProduct', F_STORE, n),
    buildRelaxedTypeFilter('boardMember', F_BOARD, n),
  ]

  const groq = `*[${filters.map((f) => `(${f})`).join(' || ')}][0...${SANITY_FETCH_LIMIT}]{
    _type,
    title,
    heroHeadline,
    programsSectionTitle,
    programsSectionSubtitle,
    pancakeTitle,
    pancakeIntro,
    spotlightTitle,
    spotlightSubtitle,
    name,
    volumeLabel,
    excerpt,
    achievement,
    speakerName,
    speakerBio,
    topic,
    description,
    shortDescription,
    role,
    bio,
    location,
    slug,
    "contentText": select(defined(content) => pt::text(content), "")
  }`

  try {
    const rows = await client.fetch<SanityHitRaw[]>(groq, params)
    const ranked = [...rows].sort((a, b) => {
      const ca = countTokenMatches(normalizeSearchHaystack(rankTextForRow(a)), rankingTokens)
      const cb = countTokenMatches(normalizeSearchHaystack(rankTextForRow(b)), rankingTokens)
      return cb - ca
    })

    const hits: SiteSearchHit[] = []
    const seenKey = new Set<string>()
    for (const row of ranked) {
      const mapped = mapSanityRow(row)
      if (!mapped) continue
      const key = `${mapped.docType}:${mapped.href}:${mapped.title}`
      if (seenKey.has(key)) continue
      seenKey.add(key)
      hits.push(mapped)
      if (hits.length >= 40) break
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
 * Site-wide search: fuzzy match on curated static routes + Sanity (portable text + ranked CMS hits).
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
