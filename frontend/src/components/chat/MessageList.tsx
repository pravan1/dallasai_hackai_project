'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageBubble } from './MessageBubble'
import type { Message } from '@/types'
import { Loader2 } from 'lucide-react'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3 max-w-md px-4">
          <div className="text-4xl">👋</div>
          <h3 className="font-semibold text-lg">Welcome to LearnFlow</h3>
          <p className="text-muted-foreground text-sm">
            Start a conversation with your AI learning assistant. Ask questions,
            get recommendations, or practice your knowledge.
          </p>
          <div className="pt-4 space-y-2">
            <p className="text-xs text-muted-foreground">Try asking:</p>
            <div className="space-y-1">
              <div className="text-sm bg-secondary px-3 py-2 rounded-md">
                "What should I learn next?"
              </div>
              <div className="text-sm bg-secondary px-3 py-2 rounded-md">
                "Explain gradient descent"
              </div>
              <div className="text-sm bg-secondary px-3 py-2 rounded-md">
                "Generate practice questions"
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <MessageBubble message={message} />
          </motion.div>
        ))}
      </AnimatePresence>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Thinking...</span>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
