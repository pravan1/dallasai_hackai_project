'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useAccessToken } from './useAccessToken'
import type { Message } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, isLoading: isUserLoading } = useUser()
  const { token: accessToken, isLoading: isTokenLoading } = useAccessToken()

  // Load initial messages
  useEffect(() => {
    if (!conversationId || isUserLoading || isTokenLoading || !accessToken) return

    async function loadMessages() {
      try {
        const response = await fetch(
          `${API_URL}/api/conversations/${conversationId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        if (!response.ok) {
          console.warn('Failed to load messages:', response.status)
          setMessages([])
          return
        }

        const data = await response.json()
        setMessages(data.messages || [])
      } catch (err) {
        console.error('Failed to load messages:', err)
        setMessages([])
      }
    }

    loadMessages()
  }, [conversationId, isUserLoading, isTokenLoading, accessToken])

  const sendMessage = useCallback(
    async (content: string, mode: 'voice' | 'text') => {
      if (!content.trim()) return
      if (!accessToken || !user) {
        setError('Not authenticated. Please log in.')
        return
      }

      // Optimistic update
      const tempUserMessage: Message = {
        id: 'temp-' + Date.now(),
        conversationId,
        role: 'user',
        content,
        inputMode: mode,
        metadata: {},
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, tempUserMessage])
      setIsLoading(true)
      setError(null)

      try {
        // Use the /api/chat endpoint for better Gemini integration with voice support
        const response = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: content,
            userId: user.sub,
            inputMode: mode,
          }),
        })

        if (!response.ok) {
          const errText = await response.text()
          throw new Error(`API error: ${response.status} - ${errText}`)
        }

        const data = await response.json()

        // Replace temp message with real messages from server
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMessage.id),
          data.userMessage,
          data.assistantMessage,
        ])
      } catch (err) {
        const errText = err instanceof Error ? err.message : 'Failed to send message'
        setError(errText)
        console.error('Chat error:', err)

        // Keep the user message visible and add a system-level error reply
        const errorReply: Message = {
          id: 'err-' + Date.now(),
          conversationId,
          role: 'assistant',
          content: `Something went wrong: ${errText}. Please check the backend is running and your connection.`,
          inputMode: 'text',
          metadata: {},
          createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMessage.id),
          { ...tempUserMessage, id: 'user-' + Date.now() },
          errorReply,
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [conversationId, user, accessToken]
  )

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  }
}
