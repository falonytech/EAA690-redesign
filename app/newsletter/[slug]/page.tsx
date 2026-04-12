import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import {
  getNewsletterIssueBySlug,
  getNewsletterIssueSlugs,
  urlFor,
} from '@/lib/sanity'
import {
  formatNewsletterIssueDate,
  getNewsletterIssuePdfHref,
} from '@/lib/newsletter'

export const revalidate = 120

export async function generateStaticParams() {
  try {
    const rows = await getNewsletterIssueSlugs()
    return (rows ?? [])
      .filter((r: { slug?: string }) => Boolean(r.slug))
      .map((r: { slug: string }) => ({ slug: r.slug }))
  } catch {
    return []
  }
}

const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      const src = urlFor(value).width(900).fit('max').url()
      return (
        <figure className="my-6">
          <Image
            src={src}
            alt={value.caption ?? ''}
            width={900}
            height={600}
            className="rounded-lg w-full object-cover"
          />
          {value.caption ? (
            <figcaption className="mt-2 text-center text-sm text-gray-500 italic">{value.caption}</figcaption>
          ) : null}
        </figure>
      )
    },
  },
  block: {
    normal: ({ children }: any) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold text-eaa-blue mt-8 mb-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold text-eaa-blue mt-6 mb-2">{children}</h3>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-eaa-yellow pl-4 italic text-gray-600 my-4">{children}</blockquote>
    ),
  },
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params
  let issue: {
    title?: string
    seoTitle?: string
    seoDescription?: string
    excerpt?: string
  } | null = null
  try {
    issue = await getNewsletterIssueBySlug(slug)
  } catch {
    issue = null
  }
  if (!issue?.title) {
    return { title: 'NAVCOM Issue' }
  }
  return {
    title: issue.seoTitle || `${issue.title} | NAVCOM`,
    description: issue.seoDescription || issue.excerpt || 'EAA Chapter 690 NAVCOM newsletter issue.',
  }
}

export default async function NewsletterIssuePage({ params }: { params: { slug: string } }) {
  const { slug } = params
  let issue: any = null
  try {
    issue = await getNewsletterIssueBySlug(slug)
  } catch {
    notFound()
  }
  if (!issue) notFound()

  const pdfHref = getNewsletterIssuePdfHref(issue)
  const coverUrl = issue.coverImage
    ? urlFor(issue.coverImage).width(960).height(520).fit('crop').url()
    : null
  const hasBody = Array.isArray(issue.content) && issue.content.length > 0

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/newsletter"
        className="inline-flex items-center gap-1 text-sm text-eaa-light-blue hover:text-eaa-blue font-semibold mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        NAVCOM archive
      </Link>

      <header className="mb-8">
        <p className="text-sm text-gray-500 mb-2">
          {formatNewsletterIssueDate(issue.issueDate)}
          {issue.volumeLabel ? ` · ${issue.volumeLabel}` : ''}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-eaa-blue mb-4">{issue.title}</h1>
        {issue.excerpt ? (
          <p className="text-lg text-gray-700 border-l-4 border-eaa-yellow pl-4 py-1">{issue.excerpt}</p>
        ) : null}
      </header>

      {pdfHref ? (
        <div className="mb-8 flex flex-wrap gap-3">
          <a
            href={pdfHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-eaa-blue text-white px-6 py-2.5 text-sm font-bold hover:bg-eaa-light-blue transition-colors"
          >
            Download PDF
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      ) : null}

      {coverUrl ? (
        <div className="mb-10 rounded-xl overflow-hidden shadow-md">
          <Image
            src={coverUrl}
            alt={issue.title ? `Cover: ${issue.title}` : 'NAVCOM cover'}
            width={960}
            height={520}
            className="w-full object-cover"
            priority
          />
        </div>
      ) : null}

      {hasBody ? (
        <section className="prose max-w-none">
          <PortableText value={issue.content} components={portableTextComponents} />
        </section>
      ) : (
        <p className="text-gray-600">
          {pdfHref
            ? 'This issue is available as a PDF above.'
            : 'No web content or PDF has been attached to this issue yet.'}
        </p>
      )}
    </div>
  )
}
