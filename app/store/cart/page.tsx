import { getSiteSettings } from '@/lib/sanity'
import StoreSectionClosed from '@/components/StoreSectionClosed'
import StoreCartPageClient from './StoreCartPageClient'

export default async function StoreCartPage() {
  const settings = await getSiteSettings()
  if (settings?.storeSectionVisible === false) {
    return <StoreSectionClosed />
  }
  return <StoreCartPageClient />
}
