import StoreCatalog from '@/components/StoreCatalog'
import { loadStoreCatalog } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function StorePage() {
  const { categories, products, fromSanity } = await loadStoreCatalog()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-eaa-blue mb-6">Store</h1>

      <StoreCatalog categories={categories} products={products} fromSanity={fromSanity} />
    </div>
  )
}
