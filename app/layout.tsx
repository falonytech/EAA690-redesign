import type { Metadata } from 'next'
import { PT_Serif } from 'next/font/google'
import './globals.css'
import SiteChrome from '@/components/SiteChrome'
import { getSiteSettings } from '@/lib/sanity'
import { getAnnouncementBar } from '@/lib/site-settings-display'

const ptSerif = PT_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-serif',
  display: 'swap',
  fallback: ['serif'],
})

export const metadata: Metadata = {
  title: 'EAA 690 - Experimental Aircraft Association Chapter 690',
  description: 'EAA 690 is a Chapter of the Experimental Aircraft Association, located at Briscoe Field (KLZU) in Lawrenceville, Georgia.',
  icons: {
    icon: '/logo.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteSettings = await getSiteSettings()
  const announcement = getAnnouncementBar(siteSettings?.siteAnnouncement)
  const showStore = siteSettings?.storeSectionVisible !== false

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={ptSerif.className} suppressHydrationWarning>
        <SiteChrome announcement={announcement} showStore={showStore}>
          {children}
        </SiteChrome>
      </body>
    </html>
  )
}
