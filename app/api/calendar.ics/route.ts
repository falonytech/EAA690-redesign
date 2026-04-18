import { NextResponse } from 'next/server'
import { getAllEvents } from '@/lib/sanity'
import { eventToVEvent, nowDtStamp, wrapVCalendar } from '@/lib/ics'
import type { Event } from '@/lib/sanity-types'

// Always fetch fresh — calendar apps poll this URL on their own schedule
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const events: Event[] = await getAllEvents()
    const dtstamp = nowDtStamp()
    const vevents = events.map((e) => eventToVEvent(e, dtstamp))

    const ics = wrapVCalendar(vevents, {
      name: 'EAA Chapter 690 Events',
      description: 'Events from EAA Chapter 690 at Briscoe Field (KLZU), Lawrenceville GA',
    })

    return new NextResponse(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="eaa690-events.ics"',
        // Allow calendar apps to cache for up to 1 hour between polls
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('ICS feed error:', err)
    return new NextResponse('Failed to generate calendar feed', { status: 500 })
  }
}
