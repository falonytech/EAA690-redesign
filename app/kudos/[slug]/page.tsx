import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getKudosBySlug, getKudos, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'

export async function generateStaticParams() {
  try {
    const all = await getKudos()
    return (all ?? [])
      .filter((k: any) => k.slug?.current)
      .map((k: any) => ({ slug: k.slug.current }))
  } catch {
    return []
  }
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      const src = urlFor(value).width(800).fit('max').url()
      return (
        <figure className="my-6">
          <Image
            src={src}
            alt={value.caption ?? ''}
            width={800}
            height={600}
            className="rounded-lg w-full object-cover"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-500 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  block: {
    normal: ({ children }: any) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold text-eaa-blue mt-8 mb-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold text-eaa-blue mt-6 mb-2">{children}</h3>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-eaa-yellow pl-4 italic text-gray-600 my-4">
        {children}
      </blockquote>
    ),
  },
}

export default async function KudosDetailPage({ params }: { params: { slug: string } }) {
  let kudo: any = null

  try {
    kudo = await getKudosBySlug(params.slug)
  } catch {
    notFound()
  }

  if (!kudo) notFound()

  const featuredUrl = kudo.featuredImage
    ? urlFor(kudo.featuredImage).width(800).height(500).fit('crop').url()
    : null

  const gallery: any[] = kudo.gallery ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link
        href="/kudos"
        className="inline-flex items-center gap-1 text-sm text-eaa-light-blue hover:text-eaa-blue font-semibold mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Kudos
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-eaa-blue mb-1">{kudo.name}</h1>
        <p className="text-eaa-light-blue font-semibold text-lg mb-1">{kudo.achievement}</p>
        {kudo.date && (
          <p className="text-sm text-gray-400">{formatDate(kudo.date)}</p>
        )}
      </header>

      {/* Featured image */}
      {featuredUrl && (
        <div className="mb-8 rounded-xl overflow-hidden shadow-md">
          <Image
            src={featuredUrl}
            alt={kudo.name}
            width={800}
            height={500}
            className="w-full object-cover"
            priority
          />
        </div>
      )}

      {/* Excerpt callout */}
      {kudo.excerpt && (
        <div className="mb-8 border-l-4 border-eaa-yellow bg-yellow-50 px-5 py-4 rounded-r-lg">
          <p className="text-gray-700 font-medium leading-relaxed">{kudo.excerpt}</p>
        </div>
      )}

      {/* Full story */}
      {kudo.content && kudo.content.length > 0 && (
        <section className="prose max-w-none mb-12">
          <PortableText value={kudo.content} components={portableTextComponents} />
        </section>
      )}

      {/* Photo Gallery */}
      {gallery.length > 0 && (
        <section id="gallery" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-eaa-blue mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-eaa-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Photo Gallery
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gallery.map((photo: any, i: number) => {
              const src = urlFor(photo).width(500).height(400).fit('crop').url()
              return (
                <figure key={i} className="group overflow-hidden rounded-lg shadow-sm">
                  <Image
                    src={src}
                    alt={photo.caption ?? `${kudo.name} photo ${i + 1}`}
                    width={500}
                    height={400}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {photo.caption && (
                    <figcaption className="px-2 py-1 text-xs text-gray-500 text-center bg-white">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>
        </section>
      )}

      {/* Back CTA */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link
          href="/kudos"
          className="inline-flex items-center gap-1 text-sm text-eaa-light-blue hover:text-eaa-blue font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Kudos
        </Link>
      </div>
    </div>
  )
}
