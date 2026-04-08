/**
 * OWASP-oriented guards for site search (length limits, internal href allowlist).
 */

/** Max characters accepted for a search query (URL, API, Sanity). */
export const MAX_SEARCH_QUERY_LENGTH = 200

/**
 * Trims and caps length. Returns empty string if nothing usable remains.
 */
export function normalizeSearchQuery(raw: string): string {
  return raw.trim().slice(0, MAX_SEARCH_QUERY_LENGTH)
}

/**
 * Allow only same-origin relative paths (no scheme, no //, no script URLs).
 * Defense-in-depth for CMS-derived hrefs.
 */
export function isSafeSiteHref(href: string): boolean {
  const h = href.trim()
  if (h.length < 1 || h.length > 512) return false
  if (!h.startsWith('/') || h.startsWith('//')) return false
  const lower = h.toLowerCase()
  if (
    lower.includes('javascript:') ||
    lower.includes('data:') ||
    lower.includes('vbscript:') ||
    lower.includes('\\')
  ) {
    return false
  }
  if (/[\0\r\n<>"`]/.test(h)) return false
  return true
}
