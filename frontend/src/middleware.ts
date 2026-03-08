import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } = process.env

  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET) {
    return NextResponse.next()
  }

  const { auth0 } = await import('@/lib/auth0')
  return await auth0.middleware(request)
}

export const config = {
  // Only intercept auth routes — never block /learn or /onboarding without credentials
  matcher: ['/auth/:path*'],
}
