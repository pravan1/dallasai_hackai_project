'use client'

import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { useChat } from '@/hooks/useChat'

export function ChatContainer() {
  const conversationId = 'default'
  const { messages, isLoading, sendMessage, addMessagesFromVoice } = useChat(conversationId)

  const handleSend = async (content: string, mode: 'voice' | 'text') => {
    await sendMessage(content, mode)
  }

  const handlePromptClick = (prompt: string) => {
    if (!isLoading) sendMessage(prompt, 'text')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onPromptClick={handlePromptClick}
        />
      </div>

      <div className="border-t border-border bg-card p-4">
        <ChatInput
          onSend={handleSend}
          onVoiceComplete={addMessagesFromVoice}
          conversationId={conversationId}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}
