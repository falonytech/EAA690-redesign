import { NextResponse } from 'next/server'
import { getEventById } from '@/lib/sanity'
import { eventToVEvent, nowDtStamp, wrapVCalendar } from '@/lib/ics'
import type { Event } from '@/lib/sanity-types'

// Per-event ICS endpoint. The whole point of this living server-side (vs a
// client-built blob download) is the response headers: iOS Safari needs
// `Content-Type: text/calendar` + `Content-Disposition: inline` to trigger the
// native "Add to Calendar?" sheet. A blob download with `<a download>` lands
// in Files app and confuses non-technical users.
export const dynamic = 'force-dynamic'

// Sanity document _ids look like UUIDs (with optional `drafts.` prefix).
// Allow only safe chars to avoid passing arbitrary input into a GROQ query.
const SAFE_ID = /^[a-zA-Z0-9._-]+$/

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id || !SAFE_ID.test(id)) {
    return new NextResponse('Invalid event id', { status: 400 })
  }

  let event: Event | null = null
  try {
    event = (await getEventById(id)) as Event | null
  } catch (err) {
    console.error('Per-event ICS fetch error:', err)
    return new NextResponse('Failed to load event', { status: 500 })
  }

  if (!event) {
    return new NextResponse('Event not found', { status: 404 })
  }

  const vevent = eventToVEvent(event, nowDtStamp())
  const ics = wrapVCalendar([vevent])

  // Single-event downloads should land in calendar UIs immediately, so we
  // intentionally don't set a long Cache-Control here.
  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${slugForFilename(event.title)}.ics"`,
      'Cache-Control': 'no-store',
    },
  })
}

function slugForFilename(title: string): string {
  const slug = title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase()
  return slug || 'event'
}
