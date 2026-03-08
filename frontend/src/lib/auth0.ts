/**
 * auth0.ts — Auth0 v4 client
 *
 * @auth0/nextjs-auth0 v4 uses Auth0Client (server) + middleware for routing.
 * All auth routes (/api/auth/login, /callback, /logout, /me) are handled
 * by the Next.js middleware in middleware.ts.
 *
 * Required env vars (frontend/.env.local):
 *   AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET,
 *   AUTH0_SECRET, AUTH0_BASE_URL
 */

import { Auth0Client } from '@auth0/nextjs-auth0/server'

export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_ISSUER_BASE_URL!.replace('https://', '').replace('http://', ''),
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  secret: process.env.AUTH0_SECRET!,
  appBaseUrl: process.env.AUTH0_BASE_URL!,
})

// Client-side hook
export { useUser } from '@auth0/nextjs-auth0/client'

/**
 * Build the greeting name from the Auth0 session user object.
 * Checks given_name → nickname → first word of name.
 */
export function getFirstName(
  user: { given_name?: string; nickname?: string; name?: string } | null | undefined,
): string | undefined {
  if (!user) return undefined
  return user.given_name ?? user.nickname ?? user.name?.split(' ')[0] ?? undefined
}
