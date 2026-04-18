import type { Metadata } from 'next'
import { PT_Serif, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import SiteChrome from '@/components/SiteChrome'
import { getSiteSettings, getProgramNavItems } from '@/lib/sanity'
import { getAnnouncementBar } from '@/lib/site-settings-display'
import { PROGRAM_NAV_FALLBACK } from '@/lib/program-nav-fallback'

const ptSerif = PT_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-serif',
  display: 'swap',
  fallback: ['serif'],
})

// Display serif used for the /kudos hero overlay (closest free analogue to
// Minerva Modern, which is paid Adobe Fonts only). Exposed as a CSS var so
// the body's default PT Serif stack is unaffected.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
  fallback: ['Cormorant', 'Georgia', 'Times New Roman', 'serif'],
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

  let programNavItems = await getProgramNavItems()
  if (programNavItems.length === 0) {
    programNavItems = PROGRAM_NAV_FALLBACK
  }

  return (
    <html lang="en" className={cormorant.variable} suppressHydrationWarning>
      <body className={ptSerif.className} suppressHydrationWarning>
        <SiteChrome announcement={announcement} showStore={showStore} programNavItems={programNavItems}>
          {children}
        </SiteChrome>
      </body>
    </html>
  )
}
