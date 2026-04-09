/**
 * Central flags for auth hardening vs local development.
 * Production on Vercel: VERCEL_ENV === "production".
 */

/** True when deployed to Vercel production (not preview/dev). */
export function isVercelProduction(): boolean {
  const v = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV
  return v === "production"
}

/**
 * Emails that may skip 2FA at sign-in and mandatory enrollment while developing.
 * Controlled by AUTH_RELAX_2FA_EMAILS (comma-separated). Never active on Vercel production.
 */
const DEFAULT_RELAX_EMAILS = ["falonya@gmail.com"]

export function relax2faEmailSet(): Set<string> {
  const raw = process.env.AUTH_RELAX_2FA_EMAILS ?? DEFAULT_RELAX_EMAILS.join(",")
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  )
}

/**
 * When true, sign-in will not require a second factor for this email (plugin runs before 2FA hook).
 * Only in development, or when AUTH_RELAX_2FA=true on non-production deploys — never on Vercel production.
 */
export function shouldBypass2faForEmail(email: string | undefined | null): boolean {
  if (!email) return false
  if (isVercelProduction()) return false
  if (!relax2faEmailSet().has(email.trim().toLowerCase())) return false
  if (process.env.NODE_ENV === "development") return true
  if (process.env.AUTH_RELAX_2FA === "true") return true
  return false
}

/**
 * Require users to complete 2FA enrollment before using the app (except bypass list).
 * Enabled on Vercel production, or set NEXT_PUBLIC_AUTH_ENFORCE_MFA=true to test on preview/local.
 */
export function shouldEnforceMfaEnrollment(): boolean {
  if (isVercelProduction()) return true
  const pub = process.env.NEXT_PUBLIC_AUTH_ENFORCE_MFA
  return pub === "1" || pub === "true"
}

/** Paths where missing MFA should not redirect to account (setup + auth flows). */
export function isMfaEnrollmentExemptPath(pathname: string): boolean {
  if (pathname.startsWith("/account")) return true
  if (pathname.startsWith("/sign-in")) return true
  if (pathname.startsWith("/signup")) return true
  return false
}

export function shouldRedirectToMfaSetup(
  pathname: string,
  user: { email?: string | null; twoFactorEnabled?: boolean | null } | undefined
): boolean {
  if (!user) return false
  if (!shouldEnforceMfaEnrollment()) return false
  if (shouldBypass2faForEmail(user.email ?? undefined)) return false
  if (user.twoFactorEnabled) return false
  if (isMfaEnrollmentExemptPath(pathname)) return false
  return true
}
