'use client'

/**
 * useAccessToken — placeholder hook when Auth is disabled.
 *
 * Auth0 is removed in the `demotest` branch, so this hook simply
 * reports that there is no access token and never performs any
 * network requests.
 */

export function useAccessToken() {
  return {
    token: null as string | null,
    isLoading: false,
    error: null as Error | null,
  }
}

