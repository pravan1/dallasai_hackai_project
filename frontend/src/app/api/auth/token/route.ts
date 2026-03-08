import { auth0 } from '@/lib/auth0'
import { NextResponse } from 'next/server'

/** Returns the current user's access token from the Auth0 session (server-side). */
export async function GET() {
  try {
    const result = await auth0.getAccessToken()
    const token = (result as { token?: string }).token ?? null
    
    if (!token) {
      console.warn('[auth/token] No token found in session')
      return NextResponse.json({ token: null }, { status: 401 })
    }
    
    console.log('[auth/token] Token fetched successfully')
    return NextResponse.json({ token })
  } catch (error) {
    console.error('[auth/token] Error fetching token:', error)
    return NextResponse.json({ token: null, error: String(error) }, { status: 500 })
  }
}
