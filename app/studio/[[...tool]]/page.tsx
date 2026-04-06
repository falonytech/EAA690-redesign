'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

// Tell Next.js not to add the site navigation / layout to this route.
// The studio has its own full-page chrome.
export const dynamic = 'force-dynamic'

export default function StudioPage() {
  return <NextStudio config={config} />
}
