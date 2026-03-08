'use client'

/**
 * useAccessToken — retrieves the Auth0 access token for API calls
 *
 * This hook fetches the access token from the server-side session
 * and keeps it fresh. Used by voice components and API clients.
 */

import { useState, useEffect } from 'react'

export function useAccessToken() {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch('/api/auth/token')
        const data = await response.json()
        
        if (!response.ok) {
          console.warn('[useAccessToken] Failed to fetch token:', data.error)
          setError(new Error(data.error || `HTTP ${response.status}`))
          setToken(null)
        } else if (data.token) {
          console.log('[useAccessToken] Token received')
          setToken(data.token)
          setError(null)
        } else {
          console.warn('[useAccessToken] No token in response')
          setError(new Error('No token in response'))
          setToken(null)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        console.error('[useAccessToken] Error fetching token:', error)
        setError(error)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchToken()
  }, [])

  return { token, isLoading, error }
}
