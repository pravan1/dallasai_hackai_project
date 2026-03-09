'use client'

/**
 * VoiceButton — mic button with 7 visual states
 *
 * This component owns no browser API logic.
 * All state transitions flow through useVoiceAssistant, which in turn
 * calls speechService and ttsService. Swap a provider by changing the
 * service file only — this component and the hook stay unchanged.
 *
 * Props mirror VoiceAssistantOptions so callers can pass user context
 * (firstName, accessToken, etc.) and receive callbacks.
 */

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Loader2, Mic, MicOff, Volume2 } from 'lucide-react'
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant'
import { ttsService } from '@/services/ttsService'
import { useHandsFree } from '@/context/HandsFreeContext'
import type { VoiceAssistantState } from '@/types'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface VoiceButtonProps {
  firstName?: string
  voiceRepliesEnabled?: boolean
  /** Use British English voice (Alfred-style) when available */
  preferBritishVoice?: boolean
  autoListenAfterGreeting?: boolean
  autoListenAfterReply?: boolean
  keepListeningOnEnd?: boolean
  accessToken?: string
  userId?: string
  conversationId?: string
  onTranscript?: (text: string) => void
  onResponse?: (text: string) => void
  onVoiceComplete?: (userMessage: import('@/types').Message, assistantMessage: import('@/types').Message) => void
  className?: string
}

// ---------------------------------------------------------------------------
// State → label / colour maps
// ---------------------------------------------------------------------------

const STATE_LABELS: Record<VoiceAssistantState, string> = {
  idle: 'Ask a question',
  'requesting-permission': 'Checking mic…',
  greeting: 'Greeting…',
  listening: 'Listening…',
  processing: 'Thinking…',
  speaking: 'Speaking…',
  error: 'Try again',
}

const STATE_RING: Record<VoiceAssistantState, string> = {
  idle: 'ring-primary/40',
  'requesting-permission': 'ring-yellow-400/60',
  greeting: 'ring-blue-400/60',
  listening: 'ring-green-400/60',
  processing: 'ring-orange-400/60',
  speaking: 'ring-purple-400/60',
  error: 'ring-destructive/60',
}

const STATE_BG: Record<VoiceAssistantState, string> = {
  idle: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  'requesting-permission': 'bg-yellow-500 text-white cursor-wait',
  greeting: 'bg-blue-500 text-white',
  listening: 'bg-green-500 text-white',
  processing: 'bg-orange-500 text-white cursor-wait',
  speaking: 'bg-purple-500 text-white',
  error: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
}

// ---------------------------------------------------------------------------
// Icon sub-component
// ---------------------------------------------------------------------------

function StateIcon({ status }: { status: VoiceAssistantState }) {
  switch (status) {
    case 'requesting-permission':
    case 'processing':
      return <Loader2 className="h-4 w-4 animate-spin" />
    case 'greeting':
    case 'speaking':
      return <Volume2 className="h-4 w-4" />
    case 'listening':
      return (
        <motion.span
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          className="flex"
        >
          <Mic className="h-4 w-4" />
        </motion.span>
      )
    case 'error':
      return <AlertCircle className="h-4 w-4" />
    default:
      return <Mic className="h-4 w-4" />
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function VoiceButton({
  firstName,
  voiceRepliesEnabled = true,
  preferBritishVoice = false,
  autoListenAfterGreeting = true,
  autoListenAfterReply = false,
  keepListeningOnEnd = false,
  accessToken,
  userId,
  conversationId,
  onTranscript,
  onResponse,
  onVoiceComplete,
  className,
}: VoiceButtonProps) {
  const { enabled: handsFree, setVoiceStatus } = useHandsFree()

  // Preload TTS voices on mount (Chrome returns [] until voices load)
  useEffect(() => {
    ttsService.waitForVoices().catch(() => {})
  }, [])

  const { status, interimTranscript, transcript, errorMessage, activate, cancel, retry } =
    useVoiceAssistant({
      firstName,
      voiceRepliesEnabled,
      preferBritishVoice,
      autoListenAfterGreeting,
      autoListenAfterReply: autoListenAfterReply || handsFree,
      keepListeningOnEnd: keepListeningOnEnd || handsFree,
      accessToken,
      userId,
      conversationId,
      onTranscript,
      onResponse,
      onVoiceComplete,
    })

  // Sync voice status up to AppShell's top bar display
  useEffect(() => { setVoiceStatus(status) }, [status, setVoiceStatus])

  // Auto-activate/cancel when the top Voice toggle changes (skip initial mount)
  const mountedRef = useRef(false)
  const prevHandsFreeRef = useRef(handsFree)
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    if (handsFree && !prevHandsFreeRef.current) {
      if (status === 'idle' || status === 'error') activate()
    } else if (!handsFree && prevHandsFreeRef.current) {
      cancel()
    }
    prevHandsFreeRef.current = handsFree
  }, [handsFree, status, activate, cancel])

  const isActive = status !== 'idle' && status !== 'error'
  const isDisabled = status === 'requesting-permission' || status === 'processing'
  const liveText = interimTranscript || transcript

  function handleClick() {
    if (isDisabled) return
    if (status === 'error') retry()
    else if (isActive) cancel()
    else activate()
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Mic button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-label={STATE_LABELS[status]}
        aria-live="polite"
        className={cn(
          'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium',
          'ring-2 ring-offset-2 transition-all duration-200',
          STATE_BG[status],
          STATE_RING[status],
          isDisabled && 'opacity-80 cursor-not-allowed'
        )}
      >
        <StateIcon status={status} />
        <span className="sr-only sm:not-sr-only">{STATE_LABELS[status]}</span>

        {/* Show stop icon when user can interrupt */}
        {isActive && !isDisabled && (
          <MicOff className="h-3 w-3 opacity-60" aria-label="Click to stop" />
        )}
      </button>

      {/* Live transcript (interim + final) */}
      <AnimatePresence>
        {status === 'listening' && liveText && (
          <motion.p
            key="transcript"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="max-w-xs text-sm text-muted-foreground"
            aria-live="polite"
          >
            <span className="font-medium text-foreground">You: </span>
            {liveText}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Error message + retry hint */}
      <AnimatePresence>
        {status === 'error' && errorMessage && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-1"
          >
            <p className="text-sm text-destructive">{errorMessage}</p>
            <p className="text-xs text-muted-foreground">
              Click the button to retry, or type your question below.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
