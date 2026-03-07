'use client'

import { motion } from 'framer-motion'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { FloatingOrb } from '@/components/orb/FloatingOrb'

export function CenterPanel() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex-1 flex flex-col bg-background overflow-hidden"
    >
      <div className="p-3 px-4 border-b border-border flex items-center gap-3">
        <FloatingOrb size={32} isActive={false} baseHue={15} floating />
        <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
          Learning Assistant
        </h2>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatContainer />
      </div>
    </motion.main>
  )
}
