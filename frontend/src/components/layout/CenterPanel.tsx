'use client'

import { motion } from 'framer-motion'
import { ChatContainer } from '@/components/chat/ChatContainer'

export function CenterPanel() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex-1 flex flex-col bg-background overflow-hidden"
    >
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Learning Assistant
        </h2>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatContainer />
      </div>
    </motion.main>
  )
}
