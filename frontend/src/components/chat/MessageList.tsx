'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageBubble } from './MessageBubble'
import { FloatingOrb } from '@/components/orb/FloatingOrb'
import type { Message } from '@/types'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  onPromptClick?: (prompt: string) => void
}

const samplePrompts = [
  'What should I learn next?',
  'Explain gradient descent simply',
  'Generate practice questions',
]

export function MessageList({ messages, isLoading, onPromptClick }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 px-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FloatingOrb size={210} isActive={isLoading} baseHue={15} floating />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center space-y-1"
        >
          <p className="text-sm font-medium text-foreground/80">
            Ask me anything about your learning journey
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="flex flex-col items-center gap-2"
        >
          {samplePrompts.map((prompt, i) => (
            <motion.button
              key={prompt}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
              onClick={() => onPromptClick?.(prompt)}
              className="text-sm italic text-muted-foreground/60 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              &ldquo;{prompt}&rdquo;
            </motion.button>
          ))}
        </motion.div>
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

      {/* Orb stays mounted so WebGL context is never destroyed (prevents white flash) */}
      <div
        className="flex items-center gap-3 transition-opacity duration-300"
        style={{ opacity: isLoading ? 1 : 0, pointerEvents: 'none', height: isLoading ? 'auto' : 0, overflow: 'hidden' }}
      >
        <FloatingOrb size={40} isActive={isLoading} floating={false} baseHue={15} />
        <span className="text-xs text-muted-foreground">Thinking…</span>
      </div>

      <div ref={messagesEndRef} />
    </div>
  )
}
