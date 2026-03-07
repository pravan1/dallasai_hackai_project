'use client'

/**
 * GestureOverlay — live webcam preview + gesture toast
 *
 * Uses useGestureNavigation (real MediaPipe) instead of the old stub.
 * Webcam is only opened when `enabled` is true.
 * Keyboard fallback (ArrowLeft / ArrowRight) is always active inside the hook.
 */

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Video } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useGestureNavigation } from '@/hooks/useGestureNavigation'

interface GestureOverlayProps {
  enabled: boolean
  onNext?: () => void
  onBack?: () => void
}

export function GestureOverlay({ enabled, onNext, onBack }: GestureOverlayProps) {
  const previewRef = useRef<HTMLVideoElement>(null)

  const { hasPermission, lastGesture, videoRef } = useGestureNavigation({
    enabled,
    onNext: onNext ?? (() => {}),
    onBack: onBack ?? (() => {}),
  })

  // Mirror the hidden detection video into the visible <video> element
  useEffect(() => {
    if (previewRef.current && videoRef.current?.srcObject) {
      previewRef.current.srcObject = videoRef.current.srcObject as MediaStream
    }
  })

  if (!enabled) return null

  if (hasPermission === false) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg p-4 max-w-xs z-50"
      >
        <p className="text-sm text-muted-foreground">
          Camera permission denied. Disable and re-enable gesture mode to try again.
        </p>
      </motion.div>
    )
  }

  return (
    <>
      {/* Live webcam preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 w-48 h-36 bg-black rounded-lg shadow-lg border-2 border-border overflow-hidden z-50"
      >
        {hasPermission === null ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center text-white space-y-2">
              <Video className="h-8 w-8 mx-auto opacity-50" />
              <p className="text-xs opacity-75">Starting camera…</p>
            </div>
          </div>
        ) : (
          <video
            ref={previewRef}
            autoPlay
            playsInline
            muted
            // scale-x-[-1] mirrors the feed so your hand feels natural
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}

        <div className="absolute bottom-1 left-0 right-0 text-center pointer-events-none">
          <span className="text-[10px] text-white/70 bg-black/50 px-1.5 py-0.5 rounded">
            Gestures active · ← →
          </span>
        </div>
      </motion.div>

      {/* Gesture action toast */}
      <AnimatePresence>
        {lastGesture && (
          <motion.div
            key={lastGesture}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-44 right-4 bg-primary text-primary-foreground rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 z-50"
          >
            {lastGesture === 'NEXT' && (
              <>
                <ArrowRight className="h-5 w-5" />
                <span className="font-medium text-sm">Next</span>
              </>
            )}
            {lastGesture === 'BACK' && (
              <>
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium text-sm">Back</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
