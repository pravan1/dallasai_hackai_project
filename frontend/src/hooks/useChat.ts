'use client'

import { useState, useEffect } from 'react'
import type { Message } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial messages
  useEffect(() => {
    if (!conversationId) return

    async function loadMessages() {
      try {
        const response = await fetch(
          `${API_URL}/api/conversations/${conversationId}/messages`
        )
        if (!response.ok) throw new Error('Failed to load messages')

        const data = await response.json()
        setMessages(data.messages || [])
      } catch (err) {
        console.error('Failed to load messages:', err)
        // Don't set error for initial load - just use empty array
      }
    }

    loadMessages()
  }, [conversationId])

  const sendMessage = async (content: string, mode: 'voice' | 'text') => {
    if (!content.trim()) return

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
      const response = await fetch(
        `${API_URL}/api/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, inputMode: mode }),
        }
      )

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()

      // Replace temp message with real messages from server
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMessage.id),
        data.userMessage,
        data.assistantMessage,
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  }
}
