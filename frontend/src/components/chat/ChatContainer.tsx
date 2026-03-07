'use client'

import { useState } from 'react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { useChat } from '@/hooks/useChat'
import type { Message } from '@/types'

export function ChatContainer() {
  const conversationId = 'default' // TODO: Get from route or state
  const { messages, isLoading, sendMessage } = useChat(conversationId)

  const handleSend = async (content: string, mode: 'voice' | 'text') => {
    await sendMessage(content, mode)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <div className="border-t bg-card p-4">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  )
}
