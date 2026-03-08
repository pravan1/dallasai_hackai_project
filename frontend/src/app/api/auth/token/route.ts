import { NextResponse } from 'next/server'

/**
 * Auth is disabled in the demotest branch.
 *
 * This endpoint remains only to avoid 404s if any legacy code calls it.
 * It always returns a null token.
 */
export async function GET() {
  return NextResponse.json({ token: null }, { status: 200 })
}

