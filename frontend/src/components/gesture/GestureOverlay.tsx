'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Video, ArrowLeft, ArrowRight } from 'lucide-react'
import { useGesture } from '@/hooks/useGesture'
import { useState } from 'react'

export function GestureOverlay() {
  const [feedbackGesture, setFeedbackGesture] = useState<string | null>(null)

  const { hasPermission, lastGesture } = useGesture((gesture) => {
    setFeedbackGesture(gesture)
    setTimeout(() => setFeedbackGesture(null), 1500)
  }, true)

  if (hasPermission === false) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg p-4 max-w-xs"
      >
        <p className="text-sm text-muted-foreground">
          Camera permission denied. Enable gestures to grant access.
        </p>
      </motion.div>
    )
  }

  return (
    <>
      {/* Webcam preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 w-48 h-36 bg-black rounded-lg shadow-lg border-2 border-border overflow-hidden"
      >
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white space-y-2">
            <Video className="h-8 w-8 mx-auto opacity-50" />
            <p className="text-xs opacity-75">Gesture Detection Active</p>
          </div>
        </div>
        {/* Actual video would go here */}
      </motion.div>

      {/* Gesture feedback */}
      <AnimatePresence>
        {feedbackGesture && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-44 right-4 bg-primary text-primary-foreground rounded-lg shadow-lg p-4 flex items-center gap-3"
          >
            {feedbackGesture === 'swipe-left' && (
              <>
                <ArrowLeft className="h-6 w-6" />
                <span className="font-medium">Swipe Left Detected</span>
              </>
            )}
            {feedbackGesture === 'swipe-right' && (
              <>
                <ArrowRight className="h-6 w-6" />
                <span className="font-medium">Swipe Right Detected</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
