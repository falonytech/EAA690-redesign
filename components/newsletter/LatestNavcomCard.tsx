import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import type { SanityImageSource } from '@sanity/image-url'
import {
  formatNewsletterIssueDate,
  getNewsletterIssuePdfHref,
} from '@/lib/newsletter'

type Issue = {
  _id: string
  title: string
  slug: { current?: string }
  issueDate?: string
  volumeLabel?: string
  excerpt?: string
  coverImage?: SanityImageSource
  pdf?: { asset?: { url?: string } | null } | null
  pdfUrl?: string | null
} | null

export default function LatestNavcomCard({
  issue,
  fallbackPdfUrl,
}: {
  issue: Issue
  /** Used when no CMS issue exists (legacy Drive link from Site Settings). */
  fallbackPdfUrl?: string | null
}) {
  const slug = issue?.slug?.current
  const pdfHref = issue ? getNewsletterIssuePdfHref(issue) : null
  const coverUrl = issue?.coverImage
    ? urlFor(issue.coverImage as SanityImageSource).width(640).height(400).fit('crop').url()
    : null

  return (
    <section className="rounded-2xl border-2 border-eaa-blue/20 bg-white shadow-md overflow-hidden">
      <div className="bg-eaa-blue px-4 py-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-eaa-yellow">
          NAVCOM — latest issue
        </h2>
      </div>
      <div className="p-5 sm:p-6">
        {issue && slug ? (
          <div className="flex flex-col sm:flex-row gap-5">
            {coverUrl ? (
              <div className="shrink-0 w-full sm:w-44 h-36 relative rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={coverUrl}
                  alt={issue.title ? `Cover: ${issue.title}` : 'NAVCOM cover'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 176px"
                />
              </div>
            ) : null}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 mb-1">
                {formatNewsletterIssueDate(issue.issueDate)}
                {issue.volumeLabel ? ` · ${issue.volumeLabel}` : ''}
              </p>
              <h3 className="text-xl font-bold text-eaa-blue mb-2 leading-snug">
                {issue.title}
              </h3>
              {issue.excerpt ? (
                <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">{issue.excerpt}</p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/newsletter/${slug}`}
                  className="inline-flex items-center justify-center rounded-full bg-eaa-blue text-white px-5 py-2 text-sm font-semibold hover:bg-eaa-light-blue transition-colors"
                >
                  Read online
                </Link>
                {pdfHref ? (
                  <a
                    href={pdfHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full border-2 border-eaa-blue text-eaa-blue px-5 py-2 text-sm font-semibold hover:bg-blue-50 transition-colors"
                    aria-label={`Download PDF for ${issue.title} (opens in a new tab)`}
                  >
                    Download PDF
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ) : fallbackPdfUrl ? (
          <div>
            <p className="text-gray-700 mb-4">
              Read the chapter newsletter (NAVCOM) — web archive and PDFs are being migrated; meanwhile here is the
              latest PDF link.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={fallbackPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-eaa-blue text-white px-5 py-2 text-sm font-semibold hover:bg-eaa-light-blue transition-colors"
                aria-label="Open latest newsletter PDF (opens in a new tab)"
              >
                Open latest PDF
              </a>
              <Link
                href="/newsletter"
                className="inline-flex items-center justify-center rounded-full border-2 border-eaa-blue text-eaa-blue px-5 py-2 text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                NAVCOM archive
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 mb-4">
              The NAVCOM newsletter archive will list each issue here as it is published. Check back soon, or visit the
              archive page for updates.
            </p>
            <Link
              href="/newsletter"
              className="inline-flex items-center justify-center rounded-full bg-eaa-blue text-white px-5 py-2 text-sm font-semibold hover:bg-eaa-light-blue transition-colors"
            >
              NAVCOM archive
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
