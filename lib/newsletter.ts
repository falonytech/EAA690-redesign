/** Resolved PDF for a NAVCOM issue (uploaded asset or external URL). */
export function getNewsletterIssuePdfHref(issue: {
  pdf?: { asset?: { url?: string; originalFilename?: string } | null } | null
  pdfUrl?: string | null
} | null): string | null {
  const fromAsset = issue?.pdf?.asset?.url
  if (fromAsset) return fromAsset
  const external = issue?.pdfUrl?.trim()
  if (external) return external
  return null
}

export function formatNewsletterIssueDate(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function issueYear(iso: string | undefined): number | null {
  if (!iso) return null
  const y = new Date(iso).getFullYear()
  return Number.isNaN(y) ? null : y
}
