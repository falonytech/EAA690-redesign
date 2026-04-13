/**
 * OWASP-oriented guards for site search (length limits, internal href allowlist).
 *
 * Search pipeline notes:
 * - Queries are trimmed/capped before GROQ, Fuse, or JSON APIs (mitigates resource abuse / oversized payloads).
 * - Sanity uses parameterized `match` globs only — no string concatenation of user input into GROQ.
 * - Fuse.js runs server-side against a fixed static page list bundled in the app, not arbitrary user HTML.
 * - CMS-derived hrefs are validated with `isSafeSiteHref` before inclusion in results (open redirect / XSS hardening).
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

/**
 * Href values from Sanity Portable Text link annotations (not validated by Studio by default).
 * Allows same-site paths via {@link isSafeSiteHref} or absolute http(s) URLs; blocks
 * `javascript:`, `data:`, protocol-relative `//`, and other schemes (OWASP DOM XSS / open redirect).
 */
export function safePortableTextLinkHref(href: string | undefined | null): string | null {
  if (href == null || typeof href !== 'string') return null
  const h = href.trim()
  if (!h) return null
  const lower = h.toLowerCase()
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return null
  }
  if (h.startsWith('/') && !h.startsWith('//')) {
    return isSafeSiteHref(h) ? h : null
  }
  try {
    const u = new URL(h)
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.toString()
  } catch {
    return null
  }
  return null
}
