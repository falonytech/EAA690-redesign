import Image from 'next/image'
import Link from 'next/link'
import { getKudos, urlFor } from '@/lib/sanity'

// Static fallback entries matching the live eaa690.org/kudos content
const STATIC_KUDOS = [
  {
    _id: 'static-1',
    name: 'Patrick Mollett',
    slug: { current: null },
    achievement: 'Delta Air Lines Pilot!',
    date: '2023-08-09',
    excerpt:
      'When he was about 13, "Young Eagle" Patrick Mollett had one goal: "I want to fly for Delta Air Lines." He achieved it, receiving his Delta wings at a ceremony at the Delta Heritage Museum on August 9, 2023. He has been assigned the Boeing 737/NYC.',
    featuredImage: null,
    hasGallery: false,
  },
  {
    _id: 'static-2',
    name: 'Jeff Coffey',
    slug: { current: null },
    achievement: 'FAA Master Pilot Award — 50 Years of Safe Flying',
    date: '2022-09-03',
    excerpt:
      'Jeff Coffey received the FAA\'s Master Pilot Award for 50 years of safe flying during a brief ceremony at the EAA 690 Hangar on September 3, 2022.',
    featuredImage: null,
    hasGallery: false,
  },
  {
    _id: 'static-3',
    name: 'Steve Hurst',
    slug: { current: null },
    achievement: 'FAA Master Pilot Award — 50 Years of Safe Flying',
    date: '2022-09-03',
    excerpt:
      'Steve Hurst received the FAA\'s Master Pilot Award for 50 years of safe flying during a brief ceremony at the EAA 690 Hangar on September 3, 2022.',
    featuredImage: null,
    hasGallery: false,
  },
  {
    _id: 'static-4',
    name: 'Josh Franklin',
    slug: { current: null },
    achievement: '2022 Ray Scholar — First Solo',
    date: '2022-07-25',
    excerpt:
      'Josh Franklin, our 2022 Ray Scholar, accomplished his First Solo on 7/25/2022 and was officially recognized at the pancake breakfast with the Shirt Tail Cutting ceremony. He is working towards his Private Pilot Certificate using Sporty\'s online course.',
    featuredImage: null,
    hasGallery: false,
  },
  {
    _id: 'static-5',
    name: 'Luke Jordan',
    slug: { current: null },
    achievement: '$2,000 Scholarship Recipient — Private Pilot Certificate',
    date: '2022-07-26',
    excerpt:
      'Luke is the recipient of a $2,000 scholarship and passed his Private Pilot Certificate on July 26th, 2022. His goal is to give back to the chapter by flying Young Eagles.',
    featuredImage: null,
    hasGallery: false,
  },
  {
    _id: 'static-6',
    name: 'Alex Kirkland',
    slug: { current: null },
    achievement: 'Commercial & Multi-Engine Ratings',
    date: '2022-08-01',
    excerpt:
      'Alex passed both his Commercial and Multi-engine check rides within two weeks of each other. He regularly flies Young Eagles and is currently in the interview process with Medway.',
    featuredImage: null,
    hasGallery: false,
  },
  {
    _id: 'static-7',
    name: 'Ensign Stephen Agudelo',
    slug: { current: null },
    achievement: 'U.S. Navy Helicopter Pilot',
    date: '2022-01-01',
    excerpt:
      'An enthusiastic participant in the chapter Youth Aviation Program, Stephen completed his private pilot training before entering Naval flight school — the only one in his class who already held a pilot\'s license. He now flies helicopters for the Navy in San Diego.',
    featuredImage: null,
    hasGallery: false,
  },
  {
    _id: 'static-8',
    name: 'Harrison Curry',
    slug: { current: null },
    achievement: '$10,000 Scholarship Recipient — Embry Riddle Graduate',
    date: '2021-01-01',
    excerpt:
      'Harrison received a $10,000 chapter scholarship, attained his private pilot certificate, and graduated from Embry Riddle University. He also participates in the Youth Aviation Program.',
    featuredImage: null,
    hasGallery: false,
  },
  {
    _id: 'static-9',
    name: 'Clyde Schnars',
    slug: { current: null },
    achievement: 'FAA Wright Brothers Master Pilot Award',
    date: '2016-04-01',
    excerpt:
      'Clyde Schnars received the FAA\'s Master Pilot Award in April 2016 for 50 years of safe flying.',
    featuredImage: null,
    hasGallery: false,
  },
  {
    _id: 'static-10',
    name: 'Ensign Christian Klos',
    slug: { current: null },
    achievement: 'U.S. Navy Aviator Candidate',
    date: '2022-07-22',
    excerpt:
      'Christian took a class at Briscoe around age 12. That seed grew into a remarkable journey: Air Traffic Controller, Embry Riddle graduate (summa cum laude), and now an Ensign accepted into the Naval Aviation program — the only one from his ship ever selected.',
    featuredImage: null,
    hasGallery: false,
  },
]

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default async function KudosPage() {
  let kudosList: any[] = []
  let usingCms = false

  try {
    const data = await getKudos()
    if (data && data.length > 0) {
      kudosList = data
      usingCms = true
    } else {
      kudosList = STATIC_KUDOS
    }
  } catch {
    kudosList = STATIC_KUDOS
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-eaa-blue mb-4">Kudos</h1>
        <p className="text-lg text-gray-600 italic font-semibold uppercase tracking-wide">
          It all begins with a spark…
        </p>
        <p className="mt-3 text-gray-700 max-w-3xl">
          EAA 690 has a long history of successes — both seasoned pilots and students alike.
          We&apos;d like to toot our own horn a bit and share them here.
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-8">
        {kudosList.map((kudo: any) => {
          const imageUrl =
            usingCms && kudo.featuredImage
              ? urlFor(kudo.featuredImage).width(400).height(300).fit('crop').url()
              : null
          const hasDetail = usingCms && kudo.slug?.current

          return (
            <article
              key={kudo._id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col sm:flex-row"
            >
              {/* Photo */}
              {imageUrl ? (
                <div className="sm:w-56 sm:shrink-0 relative">
                  <Image
                    src={imageUrl}
                    alt={kudo.name}
                    width={400}
                    height={300}
                    className="w-full h-48 sm:h-full object-cover"
                  />
                </div>
              ) : (
                <div className="sm:w-56 sm:shrink-0 bg-eaa-blue/10 flex items-center justify-center h-48 sm:h-auto">
                  <svg
                    className="w-16 h-16 text-eaa-blue/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}

              {/* Content */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <h2 className="text-xl font-bold text-eaa-blue">{kudo.name}</h2>
                    {kudo.date && (
                      <span className="text-sm text-gray-400 shrink-0">
                        {formatDate(kudo.date)}
                      </span>
                    )}
                  </div>
                  <p className="text-eaa-light-blue font-semibold text-sm mb-3">
                    {kudo.achievement}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed">{kudo.excerpt}</p>
                </div>

                {hasDetail && (
                  <div className="mt-4 flex items-center gap-4">
                    <Link
                      href={`/kudos/${kudo.slug.current}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-eaa-light-blue hover:text-eaa-blue transition-colors"
                    >
                      See Full Story
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    {kudo.hasGallery && (
                      <Link
                        href={`/kudos/${kudo.slug.current}#gallery`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-eaa-blue transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        More Photos
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {/* Nominate CTA */}
      <div className="mt-14 bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-eaa-blue mb-2">Nominate Someone</h2>
        <p className="text-gray-700">
          Know someone who deserves recognition?{' '}
          <Link href="/contact" className="text-eaa-light-blue font-semibold hover:underline">
            Contact us
          </Link>{' '}
          to nominate them for kudos.
        </p>
      </div>
    </div>
  )
}
