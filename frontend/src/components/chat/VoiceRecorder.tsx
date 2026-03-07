'use client'

import { motion } from 'framer-motion'
import { Mic } from 'lucide-react'

interface VoiceRecorderProps {
  transcript: string
}

export function VoiceRecorder({ transcript }: VoiceRecorderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-secondary/50 rounded-lg p-3 space-y-2"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Mic className="h-4 w-4 text-destructive" />
        </motion.div>
        <span>Listening...</span>
      </div>

      {transcript && (
        <div className="text-sm">
          <span className="text-muted-foreground">You said: </span>
          <span>{transcript}</span>
        </div>
      )}
    </motion.div>
  )
}
