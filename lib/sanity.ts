import { createClient, type SanityClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

let _client: SanityClient | null | undefined

/**
 * Returns a Sanity client when NEXT_PUBLIC_SANITY_PROJECT_ID is set; otherwise null.
 * Never calls createClient with an empty projectId (that throws and breaks Vercel builds).
 */
function getSanityClient(): SanityClient | null {
  if (_client !== undefined) return _client
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim()
  if (!projectId) {
    _client = null
    return null
  }
  _client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: process.env.NODE_ENV === 'production',
  })
  return _client
}

export function isSanityConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim())
}

// Image URL builder for Sanity images
export function urlFor(source: SanityImageSource) {
  const client = getSanityClient()
  if (!client) {
    throw new Error(
      'Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID (and dataset) in the environment.'
    )
  }
  return imageUrlBuilder(client).image(source)
}

// ============================================
// GROQ Queries
// ============================================

// Fetch all upcoming events (sorted by date)
export async function getUpcomingEvents() {
  const client = getSanityClient()
  if (!client) return []
  return client.fetch(`
    *[_type == "event" && date >= now()] | order(date asc) {
      _id,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      image
    }
  `)
}

// Fetch a single event by slug
export async function getEventBySlug(slug: string) {
  const client = getSanityClient()
  if (!client) return null
  return client.fetch(
    `
    *[_type == "event" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      date,
      startTime,
      endTime,
      description,
      location,
      image,
      content
    }
  `,
    { slug }
  )
}

// Fetch all news articles (sorted by date, newest first)
export async function getNewsArticles(limit?: number) {
  const client = getSanityClient()
  if (!client) return []
  const limitClause = limit ? `[0...${limit}]` : ''
  return client.fetch(`
    *[_type == "newsArticle"] | order(publishedAt desc) ${limitClause} {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      image,
      author
    }
  `)
}

// Fetch a single news article by slug
export async function getNewsArticleBySlug(slug: string) {
  const client = getSanityClient()
  if (!client) return null
  return client.fetch(
    `
    *[_type == "newsArticle" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      content,
      image,
      author
    }
  `,
    { slug }
  )
}

// Fetch presentations/speakers
export async function getPresentations(limit?: number) {
  const client = getSanityClient()
  if (!client) return []
  const limitClause = limit ? `[0...${limit}]` : ''
  return client.fetch(`
    *[_type == "presentation"] | order(date desc) ${limitClause} {
      _id,
      title,
      date,
      speakerName,
      speakerBio,
      topic,
      image
    }
  `)
}

// Fetch upcoming/featured presentation
export async function getFeaturedPresentation() {
  const client = getSanityClient()
  if (!client) return null
  return client.fetch(`
    *[_type == "presentation" && date >= now()] | order(date asc) [0] {
      _id,
      title,
      date,
      speakerName,
      speakerBio,
      topic,
      image
    }
  `)
}

// Fetch page content by slug (for generic editable pages)
export async function getPageBySlug(slug: string) {
  const client = getSanityClient()
  if (!client) return null
  return client.fetch(
    `
    *[_type == "page" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      content,
      seo
    }
  `,
    { slug }
  )
}

// Fetch site settings (logo, contact info, social links, etc.)
export async function getSiteSettings() {
  const client = getSanityClient()
  if (!client) return null
  return client.fetch(`
    *[_type == "siteSettings"][0] {
      siteName,
      tagline,
      logo,
      contactEmail,
      phone,
      address,
      socialLinks,
      breakfastPrice,
      breakfastTime,
      newsletterUrl
    }
  `)
}

// Fetch board members
export async function getBoardMembers() {
  const client = getSanityClient()
  if (!client) return []
  return client.fetch(`
    *[_type == "boardMember"] | order(order asc) {
      _id,
      name,
      role,
      bio,
      image,
      email
    }
  `)
}
