import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/better-auth'
import { getStripe } from '@/lib/stripe'

async function requireAdmin(request: NextRequest): Promise<true | NextResponse> {
  const session = await getAuth().api.getSession({ headers: request.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin role required' }, { status: 403 })
  }
  return true
}

/** GET /api/admin/payments?limit=25&starting_after=<charge_id>
 *  Returns recent Stripe charges with customer email and metadata. */
export async function GET(request: NextRequest) {
  const check = await requireAdmin(request)
  if (check !== true) return check

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') ?? '25', 10)), 100)

  // Validate starting_after is a Stripe charge ID (ch_...) to prevent forwarding
  // arbitrary strings to the Stripe API
  const rawStartingAfter = searchParams.get('starting_after')
  const startingAfter =
    rawStartingAfter && /^ch_[A-Za-z0-9]{8,}$/.test(rawStartingAfter)
      ? rawStartingAfter
      : undefined

  try {
    const stripe = getStripe()

    const [charges, subscriptions] = await Promise.all([
      stripe.charges.list({
        limit,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
        expand: ['data.customer'],
      }),
      stripe.subscriptions.list({
        limit: 25,
        status: 'active',
        expand: ['data.customer'],
      }),
    ])

    return NextResponse.json({
      charges: charges.data.map((c) => ({
        id: c.id,
        amount: c.amount,
        currency: c.currency,
        status: c.status,
        description: c.description,
        created: c.created,
        customerEmail: c.billing_details?.email ?? (c.customer as any)?.email ?? null,
        receiptUrl: c.receipt_url,
        metadata: c.metadata,
      })),
      hasMore: charges.has_more,
      activeSubscriptions: subscriptions.data.map((s) => ({
        id: s.id,
        status: s.status,
        billingCycleAnchor: s.billing_cycle_anchor,
        cancelAt: s.cancel_at,
        cancelAtPeriodEnd: s.cancel_at_period_end,
        customerEmail: (s.customer as any)?.email ?? null,
        items: s.items.data.map((i) => ({
          priceId: i.price.id,
          productId: i.price.product,
          amount: i.price.unit_amount,
          interval: i.price.recurring?.interval,
        })),
      })),
    })
  } catch (error) {
    console.error('Failed to fetch Stripe data:', error)
    return NextResponse.json({ error: 'Failed to fetch payment data' }, { status: 500 })
  }
}
