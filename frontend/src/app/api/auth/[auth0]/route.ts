/**
 * Auth0 catch-all route handler
 *
 * This single file handles all Auth0 redirect flows:
 *   GET /api/auth/login     → redirects to Auth0 Universal Login
 *   GET /api/auth/logout    → clears session and redirects to Auth0 logout
 *   GET /api/auth/callback  → exchanges code for tokens, sets session cookie
 *   GET /api/auth/me        → returns the current session user as JSON
 *
 * No custom logic required here. All configuration comes from env vars:
 *   AUTH0_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL,
 *   AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE
 */

import { handleAuth } from '@auth0/nextjs-auth0'

export const GET = handleAuth()
