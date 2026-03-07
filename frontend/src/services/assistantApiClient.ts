/**
 * assistantApiClient — typed API client for the LearnFlow backend
 *
 * All fetch calls go through this module so that:
 * - Auth0 access tokens are attached in one place
 * - The base URL is configured from env vars
 * - Response types are explicit
 * - Swapping base URL (e.g. from Express to FastAPI) requires one change
 *
 * Usage:
 *   const reply = await assistantApiClient.chat({ message, userId }, accessToken)
 */

import type { Message, Recommendation, User } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ---------------------------------------------------------------------------
// Request / response shapes
// ---------------------------------------------------------------------------

export interface ChatRequest {
  message: string
  conversationId?: string
  userId: string
  inputMode?: 'voice' | 'text'
}

export interface ChatResponse {
  userMessage: Message
  assistantMessage: Message
}

export interface RecommendationsResponse {
  recommendations: Recommendation[]
}

export interface ProfileResponse {
  user: User
}

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function request<T>(
  endpoint: string,
  init: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(init.headers as Record<string, string>),
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText)
    throw new Error(`[${response.status}] ${endpoint}: ${body}`)
  }

  return response.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Public API surface
// ---------------------------------------------------------------------------

export const assistantApiClient = {
  /**
   * Send a chat message. Returns both the persisted user message and
   * the assistant's reply (with metadata like sources and follow-up questions).
   */
  chat(payload: ChatRequest, accessToken: string): Promise<ChatResponse> {
    return request<ChatResponse>(
      '/api/chat',
      { method: 'POST', body: JSON.stringify(payload) },
      accessToken
    )
  },

  /**
   * Fetch personalised recommendations for the current user.
   */
  getRecommendations(userId: string, accessToken: string): Promise<RecommendationsResponse> {
    return request<RecommendationsResponse>(
      `/api/recommendations?userId=${encodeURIComponent(userId)}`,
      {},
      accessToken
    )
  },

  /**
   * Fetch the user profile (name, role, settings, etc.).
   */
  getProfile(userId: string, accessToken: string): Promise<ProfileResponse> {
    return request<ProfileResponse>(
      `/api/profile/${encodeURIComponent(userId)}`,
      {},
      accessToken
    )
  },

  /**
   * Partial-update the user profile (e.g. settings toggles, experience level).
   */
  updateProfile(
    userId: string,
    data: Partial<User> & Record<string, unknown>,
    accessToken: string
  ): Promise<ProfileResponse> {
    return request<ProfileResponse>(
      `/api/profile/${encodeURIComponent(userId)}`,
      { method: 'PATCH', body: JSON.stringify(data) },
      accessToken
    )
  },
}
