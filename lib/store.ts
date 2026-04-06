import type { StoreCategory, StoreProduct } from '@/lib/sanity-types'
import { getStoreCategories, getStoreProducts } from '@/lib/sanity'
import { fallbackStoreCategories, fallbackStoreProducts } from '@/lib/store-fallback'

function dedupeCategoriesFromProducts(products: StoreProduct[]): StoreCategory[] {
  const map = new Map<string, StoreCategory>()
  for (const p of products) {
    for (const c of p.categories || []) {
      if (c?._id) map.set(c._id, c)
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const o = (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
    return o !== 0 ? o : a.title.localeCompare(b.title)
  })
}

/**
 * Loads categories + products from Sanity; falls back to static data when the
 * dataset has no active products yet.
 */
export async function loadStoreCatalog(): Promise<{
  categories: StoreCategory[]
  products: StoreProduct[]
  fromSanity: boolean
}> {
  let categories: StoreCategory[] = []
  let products: StoreProduct[] = []
  try {
    const [c, p] = await Promise.all([getStoreCategories(), getStoreProducts()])
    categories = c || []
    products = p || []
  } catch {
    // Network / misconfiguration — use fallback
    return {
      categories: fallbackStoreCategories,
      products: fallbackStoreProducts,
      fromSanity: false,
    }
  }

  if (products.length === 0) {
    return {
      categories: fallbackStoreCategories,
      products: fallbackStoreProducts,
      fromSanity: false,
    }
  }

  if (categories.length === 0) {
    categories = dedupeCategoriesFromProducts(products)
  }

  return { categories, products, fromSanity: true }
}
