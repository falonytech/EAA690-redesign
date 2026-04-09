import type { BetterAuthPlugin } from "better-auth"
import { createAuthMiddleware } from "@better-auth/core/api"
import { shouldBypass2faForEmail } from "@/lib/auth-security"

/**
 * Runs **before** the bundled `twoFactor` plugin's after-hook on credential sign-in.
 * For allowlisted dev emails, temporarily marks the in-memory session user as not requiring 2FA
 * so Better Auth does not strip the session and issue `twoFactorRedirect`.
 */
export function relaxTwoFactorPlugin(): BetterAuthPlugin {
  return {
    id: "relax-two-factor",
    hooks: {
      after: [
        {
          matcher: (ctx) =>
            ctx.path === "/sign-in/email" ||
            ctx.path === "/sign-in/username" ||
            ctx.path === "/sign-in/phone-number",
          handler: createAuthMiddleware(async (ctx) => {
            const data = ctx.context.newSession
            const email = data?.user?.email
            if (!data?.user || !email) return
            if (!shouldBypass2faForEmail(email)) return
            if (!data.user.twoFactorEnabled) return
            data.user = { ...data.user, twoFactorEnabled: false }
          }),
        },
      ],
    },
  }
}
