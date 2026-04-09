import Link from 'next/link'

export default function StoreSectionClosed() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-3xl font-bold text-eaa-blue mb-3">Chapter store</h1>
      <p className="text-gray-600 mb-6">
        The online store is temporarily unavailable. Please check back later or contact the chapter for
        merchandise and membership options.
      </p>
      <Link
        href="/contact"
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-eaa-blue text-white font-medium hover:bg-eaa-light-blue transition-colors"
      >
        Contact us
      </Link>
    </div>
  )
}
