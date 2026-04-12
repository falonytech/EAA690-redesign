import Link from 'next/link'
import type { Metadata } from 'next'
import { getNewsletterIssues, getSiteSettings, urlFor } from '@/lib/sanity'
import {
  formatNewsletterIssueDate,
  getNewsletterIssuePdfHref,
  issueYear,
} from '@/lib/newsletter'
import type { SanityImageSource } from '@sanity/image-url'
import Image from 'next/image'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'NAVCOM Newsletter',
  description:
    'Browse the EAA Chapter 690 NAVCOM newsletter — monthly chapter news, programs, and archives.',
}

type IssueRow = {
  _id: string
  title: string
  slug: { current?: string }
  issueDate?: string
  volumeLabel?: string
  excerpt?: string
  coverImage?: SanityImageSource
  pdf?: { asset?: { url?: string } | null } | null
  pdfUrl?: string | null
}

type Props = {
  searchParams: Promise<{ year?: string }>
}

export default async function NewsletterArchivePage({ searchParams }: Props) {
  const { year: yearParam } = await searchParams
  const parsed = yearParam ? parseInt(yearParam, 10) : NaN
  const selectedYear = Number.isFinite(parsed) ? parsed : null

  let issues: IssueRow[] = []
  try {
    const raw = await getNewsletterIssues()
    issues = Array.isArray(raw) ? raw : []
  } catch {
    issues = []
  }

  const settings = await getSiteSettings()
  const legacyArchiveUrl = settings?.newsletterArchiveFolderUrl?.trim() || null

  const years = Array.from(
    new Set(
      issues.map((i) => issueYear(i.issueDate)).filter((y): y is number => y !== null)
    )
  ).sort((a, b) => b - a)

  const filtered =
    selectedYear !== null ? issues.filter((i) => issueYear(i.issueDate) === selectedYear) : issues

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-eaa-light-blue mb-6">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2 text-gray-400" aria-hidden="true">
          /
        </span>
        <span className="text-gray-600">NAVCOM</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-4xl font-bold text-eaa-blue mb-3">NAVCOM newsletter</h1>
        <p className="text-lg text-gray-700 max-w-2xl">
          The chapter newsletter — <strong className="font-medium text-gray-800">Navigation Communication</strong> — is
          published monthly. Browse recent issues below; PDFs may be attached to each issue or linked from our legacy
          archive.
        </p>
      </header>

      {legacyArchiveUrl ? (
        <div className="mb-10 rounded-lg border border-blue-100 bg-blue-50/80 px-5 py-4 text-gray-800">
          <p className="font-semibold text-eaa-blue mb-1">Older PDF archive</p>
          <p className="text-sm text-gray-700 mb-3">
            Many past issues live in our historical folder (including editions before this site archive).
          </p>
          <a
            href={legacyArchiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-semibold text-eaa-light-blue hover:text-eaa-blue underline"
          >
            Open full PDF archive (folder)
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      ) : null}

      {years.length > 0 ? (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600 mr-1">Filter by year:</span>
          <Link
            href="/newsletter"
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selectedYear === null ? 'bg-eaa-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </Link>
          {years.map((y) => (
            <Link
              key={y}
              href={`/newsletter?year=${y}`}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedYear === y ? 'bg-eaa-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {y}
            </Link>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-gray-600 py-8">
          No newsletter issues are published here yet. Editors can add issues in Sanity Studio under{' '}
          <strong className="font-medium text-gray-800">NAVCOM Issues</strong>.
        </p>
      ) : (
        <ul className="space-y-6">
          {filtered.map((issue) => {
            const slug = issue.slug?.current
            const pdfHref = getNewsletterIssuePdfHref(issue)
            const thumb = issue.coverImage
              ? urlFor(issue.coverImage).width(200).height(140).fit('crop').url()
              : null
            if (!slug) return null
            return (
              <li key={issue._id}>
                <article className="flex flex-col sm:flex-row gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                  {thumb ? (
                    <div className="relative h-36 w-full shrink-0 sm:w-44 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={thumb}
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
                    <h2 className="text-xl font-bold text-eaa-blue mb-2">
                      <Link href={`/newsletter/${slug}`} className="hover:underline">
                        {issue.title}
                      </Link>
                    </h2>
                    {issue.excerpt ? <p className="text-gray-700 text-sm mb-3 line-clamp-3">{issue.excerpt}</p> : null}
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/newsletter/${slug}`}
                        className="text-sm font-semibold text-eaa-light-blue hover:text-eaa-blue"
                      >
                        Read online →
                      </Link>
                      {pdfHref ? (
                        <a
                          href={pdfHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-gray-600 hover:text-eaa-blue"
                        >
                          PDF
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
