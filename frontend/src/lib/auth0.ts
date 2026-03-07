/**
 * auth0.ts — Auth0 client helpers
 *
 * Re-exports everything you need from @auth0/nextjs-auth0 so the rest of
 * the app imports from '@/lib/auth0' rather than the package directly.
 * This makes future provider swaps a single-file change.
 *
 * Server Components: use getSession(), withPageAuthRequired()
 * Client Components: use useUser()
 *
 * Setup checklist:
 *   1. pnpm add @auth0/nextjs-auth0
 *   2. Set AUTH0_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL,
 *      AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET in .env.local
 *   3. Add src/app/api/auth/[auth0]/route.ts (see that file)
 *   4. Wrap root layout.tsx with <UserProvider>
 */

export {
  getSession,
  withPageAuthRequired,
  withApiAuthRequired,
  getAccessToken,
} from '@auth0/nextjs-auth0'

export { useUser } from '@auth0/nextjs-auth0/client'

/**
 * Build the greeting name from the Auth0 session user object.
 * Auth0 stores the given name in user.given_name or user.nickname.
 * Falls back to undefined so useVoiceAssistant shows the generic greeting.
 */
export function getFirstName(user: { given_name?: string; nickname?: string; name?: string } | null | undefined): string | undefined {
  if (!user) return undefined
  return user.given_name ?? user.nickname ?? user.name?.split(' ')[0] ?? undefined
}
