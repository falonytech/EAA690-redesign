/**
 * Curated index for site-wide search (pages without CMS or as a baseline when Sanity is empty).
 * Keep titles/snippets aligned with on-page copy where possible.
 */
export type StaticSearchEntry = {
  title: string
  href: string
  snippet: string
  keywords?: string
}

export const STATIC_SITE_SEARCH_INDEX: StaticSearchEntry[] = [
  { title: 'Home', href: '/', snippet: 'EAA 690 at Briscoe Field (KLZU), Gold Chapter, Young Eagles, pancake breakfast.' },
  { title: 'Calendar', href: '/calendar', snippet: 'Chapter events, pancake breakfasts, fly-outs, and subscribe to ICS feeds.' },
  { title: 'Contact', href: '/contact', snippet: 'Reach the chapter by email, phone, or visit Hangar 1 at Briscoe Field.' },
  { title: 'Donate', href: '/donate', snippet: 'Support EAA 690 as a 501(c)(3) — tax-deductible donations via Stripe.' },
  { title: 'Join / Renew', href: '/join', snippet: 'Chapter membership tiers, Young Eagles, and recurring support options.' },
  { title: 'Store', href: '/store', snippet: 'Memberships, pancake breakfast tickets, plaques, prints, and chapter merchandise.' },
  { title: 'News', href: '/news', snippet: 'Chapter announcements, breakfast updates, and Gold Chapter news.' },
  { title: 'Media', href: '/media', snippet: 'Photos, videos, and media from chapter events and programs.' },
  { title: 'Kudos', href: '/kudos', snippet: 'Celebrating members’ achievements in aviation and the community.' },
  { title: 'Chapter overview', href: '/chapter', snippet: 'Chapter information, leadership, and quick links to chapter pages.' },
  { title: 'Agenda', href: '/chapter/agenda', snippet: 'Board of Directors meeting agendas and chapter business.' },
  { title: 'Board & chapter leaders', href: '/chapter/board', snippet: 'Officers, Board of Trustees, Members of the Year, and food service chairs.' },
  { title: 'Bylaws', href: '/chapter/bylaws', snippet: 'Chapter bylaws and governance documents.' },
  { title: 'General information', href: '/chapter/general-info', snippet: 'General chapter details for members and visitors.' },
  { title: 'Hangar rental', href: '/chapter/hangar-rental', snippet: 'Hangar and ramp information for qualifying members.' },
  { title: 'Visit us', href: '/chapter/visit-us', snippet: 'Directions to Briscoe Field (KLZU), hangar location, and visiting the chapter.' },
  { title: 'Programs overview', href: '/programs', snippet: 'Youth aviation, scholarships, summer camp, Young Eagles, Eagle Flights, and more.' },
  { title: 'Young Eagles', href: '/programs/young-eagles', snippet: 'Free first flights for youth ages 8–17.' },
  { title: 'Eagle Flights', href: '/programs/eagle-flights', snippet: 'Introductory flights for adults new to general aviation.' },
  { title: 'Youth Aviation Program', href: '/programs/youth-aviation', snippet: 'Hands-on aircraft building and youth STEM aviation for ages 14+.' },
  { title: 'Scholarships', href: '/programs/scholarships', snippet: 'Ray Aviation and chapter scholarships for young pilots.' },
  { title: 'Summer Camp', href: '/programs/summer-camp', snippet: 'Week-long aviation STEM summer camp at Gwinnett County Airport.' },
  { title: 'VMC / IMC Club', href: '/programs/vmc-imc-club', snippet: 'Monthly scenario-based safety meetings for pilots.' },
  { title: 'Ground School', href: '/programs/ground-school', snippet: 'Ground training resources and chapter study groups.' },
  { title: 'Outreach', href: '/programs/outreach', snippet: 'Community outreach and aviation education.' },
  { title: 'Sign in', href: '/sign-in', snippet: 'Member and volunteer sign-in.' },
  { title: 'Members area', href: '/members', snippet: 'Resources for logged-in chapter members.' },
]

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Tokenize query; drop very short noise tokens. */
export function searchQueryTokens(raw: string): string[] {
  const n = normalize(raw)
  if (!n) return []
  return n.split(' ').filter((t) => t.length >= 2).slice(0, 12)
}

/**
 * Score static entries: every query token must appear in title, snippet, or keywords.
 * Returns entries sorted by number of extra token hits (relevance hint).
 */
export function searchStaticPages(query: string, limit = 25): StaticSearchEntry[] {
  const tokens = searchQueryTokens(query)
  if (tokens.length === 0) return []

  const scored: { entry: StaticSearchEntry; score: number }[] = []

  for (const entry of STATIC_SITE_SEARCH_INDEX) {
    const hay = normalize(
      `${entry.title} ${entry.snippet} ${entry.keywords ?? ''}`,
    )
    let ok = true
    let score = 0
    for (const t of tokens) {
      if (!hay.includes(t)) {
        ok = false
        break
      }
      const inTitle = normalize(entry.title).includes(t)
      score += inTitle ? 3 : 1
    }
    if (ok) scored.push({ entry, score })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((s) => s.entry)
}
