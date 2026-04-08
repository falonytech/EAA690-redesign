import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { loadStoreCatalog } from '@/lib/store'
import { STORE_PRODUCT_ID_RE } from '@/lib/store-ids'

const QUANTITY_MIN = 1
const QUANTITY_MAX = 10
const STORE_CART_MAX_LINES = 30
const STRIPE_PRICE_ID_RE = /^price_[A-Za-z0-9]{8,}$/
const UNIT_AMOUNT_MIN_CENTS = 50
const UNIT_AMOUNT_MAX_CENTS = 500_000
/** Guardrail against pathological totals (OWASP: resource exhaustion / overflow). */
const SUBTOTAL_MAX_CENTS = 50_000_000 // $500k

// Same-origin POST; limit abuse of Stripe + Sanity (in-memory; one process only).
const RATE_WINDOW_MS = 60_000
const RATE_LIMIT = 30
const _rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = _rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    _rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * POST { items: { productId: string; quantity: number }[] }
 * Returns { subtotalCents, incomplete } — same pricing rules as checkout (catalog + Stripe Price IDs).
 */
export async function POST(request: NextRequest) {
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 })
  }

  let body: { items?: { productId: string; quantity: number }[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const rawItems = body.items
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return NextResponse.json({ subtotalCents: 0, incomplete: false, currency: 'usd' as const })
  }

  const qtyMerged = new Map<string, number>()
  for (const row of rawItems) {
    if (!row || typeof row !== 'object') continue
    const productId = (row as { productId?: string }).productId
    const rawQty = (row as { quantity?: unknown }).quantity
    if (!productId || typeof productId !== 'string' || !STORE_PRODUCT_ID_RE.test(productId)) {
      return NextResponse.json({ error: 'Invalid product reference.' }, { status: 400 })
    }
    const q =
      typeof rawQty === 'number' && Number.isInteger(rawQty) && rawQty >= QUANTITY_MIN && rawQty <= QUANTITY_MAX
        ? rawQty
        : null
    if (q === null) {
      return NextResponse.json({ error: 'Invalid quantity.' }, { status: 400 })
    }
    qtyMerged.set(productId, Math.min(QUANTITY_MAX, (qtyMerged.get(productId) ?? 0) + q))
  }

  if (qtyMerged.size > STORE_CART_MAX_LINES) {
    return NextResponse.json({ error: 'Too many distinct items.' }, { status: 400 })
  }

  let stripe: ReturnType<typeof getStripe> | null = null
  try {
    stripe = getStripe()
  } catch {
    stripe = null
  }

  try {
    const { products } = await loadStoreCatalog()
    const byId = new Map(products.map((p) => [p._id, p]))

    let subtotalCents = 0
    let incomplete = false

    for (const [productId, quantity] of Array.from(qtyMerged.entries())) {
      const p = byId.get(productId)
      if (!p) {
        incomplete = true
        continue
      }

      const cents = p.unitAmountCents
      if (
        typeof cents === 'number' &&
        Number.isInteger(cents) &&
        cents >= UNIT_AMOUNT_MIN_CENTS &&
        cents <= UNIT_AMOUNT_MAX_CENTS
      ) {
        subtotalCents += cents * quantity
        continue
      }

      const priceId = p.stripePriceId?.trim()
      if (priceId && STRIPE_PRICE_ID_RE.test(priceId) && stripe) {
        try {
          const price = await stripe.prices.retrieve(priceId)
          if (price.unit_amount != null && price.type === 'one_time') {
            subtotalCents += price.unit_amount * quantity
            continue
          }
        } catch {
          incomplete = true
          continue
        }
      }

      incomplete = true
    }

    if (!Number.isFinite(subtotalCents) || subtotalCents < 0 || subtotalCents > SUBTOTAL_MAX_CENTS) {
      return NextResponse.json({ error: 'Could not calculate cart total.' }, { status: 500 })
    }

    return NextResponse.json({
      subtotalCents: Math.round(subtotalCents),
      incomplete,
      currency: 'usd' as const,
    })
  } catch (error) {
    console.error('Cart total error:', error)
    return NextResponse.json({ error: 'Could not calculate cart total.' }, { status: 500 })
  }
}
