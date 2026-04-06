'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import type { StoreCategory, StoreProduct } from '@/lib/sanity-types'
import { urlFor } from '@/lib/sanity'

const LIVE_STORE = 'https://www.eaa690.org/store'

type Props = {
  categories: StoreCategory[]
  products: StoreProduct[]
  fromSanity: boolean
}

export default function StoreCatalog({ categories, products, fromSanity }: Props) {
  const [activeSlug, setActiveSlug] = useState<string | 'all'>('all')

  const filtered = useMemo(() => {
    if (activeSlug === 'all') return products
    return products.filter((p) =>
      (p.categories || []).some((c) => c.slug?.current === activeSlug),
    )
  }, [products, activeSlug])

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-lg text-gray-700 max-w-3xl">
          Show your support for EAA 690 — memberships, chapter merch, event meals, prints, and more.
          Purchases on the chapter site are processed securely (Stripe). Use the filters to browse by
          category (food, plaques, prints, memberships, etc.).
        </p>
        {!fromSanity && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 shrink-0">
            Showing sample inventory. Add products in{' '}
            <a href="/studio" className="underline font-medium">
              Sanity Studio
            </a>{' '}
            to manage this page.
          </p>
        )}
      </div>

      <div className="mb-8">
        <p className="text-sm font-semibold text-eaa-blue mb-2">Filters</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSlug('all')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeSlug === 'all'
                ? 'bg-eaa-blue text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => setActiveSlug(cat.slug.current)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeSlug === cat.slug.current
                  ? 'bg-eaa-blue text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-600 py-8">No products match this filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <article
              key={item._id}
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
            >
              <div className="h-52 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <Image
                    src={urlFor(item.image).width(600).height(400).fit('crop').url()}
                    alt={item.title}
                    width={600}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-gray-400 text-sm px-4 text-center">No image</span>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex flex-wrap gap-1 mb-2">
                  {(item.categories || []).map((c) => (
                    <span
                      key={c._id}
                      className="text-xs bg-blue-50 text-eaa-blue px-2 py-0.5 rounded"
                    >
                      {c.title}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-bold text-eaa-blue mb-2">{item.title}</h2>
                {item.shortDescription && (
                  <p className="text-gray-600 mb-4 text-sm flex-1">{item.shortDescription}</p>
                )}
                <div className="flex items-center justify-between gap-3 mt-auto pt-2">
                  <span className="text-xl font-bold text-eaa-blue">{item.priceDisplay}</span>
                  <a
                    href={item.externalPurchaseUrl || LIVE_STORE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-eaa-yellow text-eaa-blue px-4 py-2 rounded-md font-semibold hover:bg-yellow-400 transition-colors text-center text-sm whitespace-nowrap"
                  >
                    {item.externalPurchaseUrl ? 'Purchase' : 'View on store'}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-12 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-eaa-blue mb-4">Payment information</h2>
        <p className="text-gray-700">
          All transactions on the chapter store are secured through Stripe. For questions about orders
          or in-person purchases, please{' '}
          <a href="/contact" className="text-eaa-light-blue hover:underline">
            contact us
          </a>
          .
        </p>
      </div>
    </>
  )
}
