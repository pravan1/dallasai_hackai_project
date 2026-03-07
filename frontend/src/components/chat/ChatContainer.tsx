'use client'

import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { useChat } from '@/hooks/useChat'
import { FloatingOrb } from '@/components/orb/FloatingOrb'
import { motion, AnimatePresence } from 'framer-motion'

export function ChatContainer() {
  const conversationId = 'default'
  const { messages, isLoading, sendMessage } = useChat(conversationId)

  const handleSend = async (content: string, mode: 'voice' | 'text') => {
    await sendMessage(content, mode)
  }

  const handlePromptClick = (prompt: string) => {
    if (!isLoading) sendMessage(prompt, 'text')
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Small persistent orb — floats in top-right when chat is active */}
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.4 }}
            className="absolute top-3 right-3 z-10 pointer-events-none"
          >
            <FloatingOrb
              size={54}
              isActive={isLoading}
              baseHue={15}
              floating
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onPromptClick={handlePromptClick}
        />
      </div>

      <div className="border-t border-border bg-card p-4">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  )
}
