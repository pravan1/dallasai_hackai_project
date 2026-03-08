import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * No-op middleware for the demotest branch.
 *
 * All Auth0 routing has been removed; requests simply pass through.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}

