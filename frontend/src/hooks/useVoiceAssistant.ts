'use client'

/**
 * useVoiceAssistant — voice button state machine
 *
 * States:
 *   idle → requesting-permission → greeting → listening → processing → speaking → idle
 *                                                        ↗ (retry)
 *   any state → error
 *   any state → idle  (via cancel())
 *
 * This hook never imports SpeechRecognition or speechSynthesis directly.
 * All browser API calls go through speechService and ttsService so that
 * providers can be swapped without touching this file or any UI component.
 */

import { useCallback, useReducer, useRef } from 'react'
import { speechService } from '@/services/speechService'
import { ttsService } from '@/services/ttsService'
import { assistantApiClient } from '@/services/assistantApiClient'
import type { VoiceAssistantState } from '@/types'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface VoiceAssistantOptions {
  /** Used in the greeting: "Hey {firstName}, what would you like to learn today?" */
  firstName?: string
  /** If false, the AI response is shown as text only — TTS is skipped. Default: true */
  voiceRepliesEnabled?: boolean
  /** If false, listening does not auto-start after the greeting. Default: true */
  autoListenAfterGreeting?: boolean
  /** If true, automatically starts listening again after the AI finishes speaking. Default: false */
  autoListenAfterReply?: boolean
  /** Auth0 access token. Required for API calls. */
  accessToken?: string
  /** Auth0 user sub / internal user ID. Required for API calls. */
  userId?: string
  /** Called with the final user transcript when speech recognition finishes. */
  onTranscript?: (text: string) => void
  /** Called with the assistant's text reply. */
  onResponse?: (text: string) => void
}

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

interface MachineState {
  status: VoiceAssistantState
  /** Committed final transcript from the last recognition session. */
  transcript: string
  /** In-flight partial transcript (interim result). */
  interimTranscript: string
  /** Set when status === 'error'. */
  errorMessage: string | null
}

type Action =
  | { type: 'REQUEST_PERMISSION' }
  | { type: 'GREETING' }
  | { type: 'LISTEN' }
  | { type: 'INTERIM'; text: string }
  | { type: 'FINAL'; text: string }
  | { type: 'PROCESSING' }
  | { type: 'SPEAKING' }
  | { type: 'IDLE' }
  | { type: 'ERROR'; message: string }

function reducer(state: MachineState, action: Action): MachineState {
  switch (action.type) {
    case 'REQUEST_PERMISSION':
      return { ...state, status: 'requesting-permission', errorMessage: null }
    case 'GREETING':
      return { ...state, status: 'greeting' }
    case 'LISTEN':
      return { ...state, status: 'listening', transcript: '', interimTranscript: '' }
    case 'INTERIM':
      return { ...state, interimTranscript: action.text }
    case 'FINAL':
      return { ...state, transcript: action.text, interimTranscript: '' }
    case 'PROCESSING':
      return { ...state, status: 'processing' }
    case 'SPEAKING':
      return { ...state, status: 'speaking' }
    case 'IDLE':
      return { ...state, status: 'idle', interimTranscript: '' }
    case 'ERROR':
      return { ...state, status: 'error', errorMessage: action.message }
  }
}

const initialState: MachineState = {
  status: 'idle',
  transcript: '',
  interimTranscript: '',
  errorMessage: null,
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useVoiceAssistant(options: VoiceAssistantOptions = {}) {
  const {
    firstName,
    voiceRepliesEnabled = true,
    autoListenAfterGreeting = true,
    autoListenAfterReply = false,
    accessToken,
    userId,
    onTranscript,
    onResponse,
  } = options

  const [state, dispatch] = useReducer(reducer, initialState)

  // Lets async flows know when the user has cancelled mid-flow
  const cancelledRef = useRef(false)
  // Ref so sendToAssistant can call startListening without a circular dep
  const startListeningRef = useRef<(() => void) | null>(null)
  // Incremented each time a new recognition session starts — prevents stale onEnd from killing a newer session
  const sessionIdRef = useRef(0)
  // Background barge-in recognition that runs while TTS is speaking
  const bargeinRef = useRef<{ abort: () => void } | null>(null)
  // Set to true when barge-in fires so the normal post-TTS flow doesn't double-start listening
  const bargedInRef = useRef(false)

  const greetingText = firstName
    ? `Hey ${firstName}, what would you like to learn today?`
    : `Hey there, what would you like to learn today?`

  // ---------------------------------------------------------------------------
  // Internal: barge-in listener — runs a background mic while TTS is speaking.
  // Any detected speech cancels TTS and jumps straight to listening.
  // ---------------------------------------------------------------------------

  function startBargeinListener() {
    if (typeof window === 'undefined') return
    const SR = (window as Window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition
      ?? (window as Window & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition
    if (!SR) return

    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-US'

    r.onresult = (event: Event) => {
      const e = event as unknown as { results: SpeechRecognitionResultList }
      const transcript = Array.from(e.results)
        .map(res => (res as SpeechRecognitionResult)[0].transcript)
        .join(' ')
        .toLowerCase()
      if (!transcript.includes('excuse me')) return
      r.abort()
      bargeinRef.current = null
      bargedInRef.current = true
      ttsService.cancel()
      if (!cancelledRef.current) {
        startListeningRef.current?.()
      }
    }
    r.onerror = () => { bargeinRef.current = null }
    r.onend = () => { bargeinRef.current = null }

    r.start()
    bargeinRef.current = r
  }

  function stopBargeinListener() {
    bargeinRef.current?.abort()
    bargeinRef.current = null
  }

  // ---------------------------------------------------------------------------
  // Internal: send transcript to API and optionally speak the reply
  // ---------------------------------------------------------------------------

  const sendToAssistant = useCallback(
    async (transcript: string) => {
      if (cancelledRef.current) return

      if (!userId) {
        dispatch({ type: 'IDLE' })
        return
      }

      dispatch({ type: 'PROCESSING' })

      try {
        const result = await assistantApiClient.chat(
          { message: transcript, userId, inputMode: 'voice' },
          accessToken ?? ''
        )

        if (cancelledRef.current) return

        const replyText = result.assistantMessage.content
        onResponse?.(replyText)

        if (voiceRepliesEnabled) {
          dispatch({ type: 'SPEAKING' })
          bargedInRef.current = false
          startBargeinListener()
          await ttsService.speak(replyText)
          stopBargeinListener()
        }

        if (!cancelledRef.current && !bargedInRef.current) {
          if (autoListenAfterReply) {
            startListeningRef.current?.()
          } else {
            dispatch({ type: 'IDLE' })
          }
        }
      } catch {
        stopBargeinListener()
        if (!cancelledRef.current) {
          dispatch({ type: 'ERROR', message: 'Failed to get a response. Please try again.' })
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessToken, userId, voiceRepliesEnabled, autoListenAfterReply, onResponse]
  )

  // ---------------------------------------------------------------------------
  // Internal: start speech recognition
  // ---------------------------------------------------------------------------

  const startListening = useCallback(() => {
    if (cancelledRef.current) return

    // Each session gets a unique ID — stale onEnd callbacks from old sessions are ignored
    const sessionId = ++sessionIdRef.current

    dispatch({ type: 'LISTEN' })

    speechService.start({
      interimResults: true,
      onResult: ({ transcript, isFinal }) => {
        if (isFinal) {
          dispatch({ type: 'FINAL', text: transcript })
          onTranscript?.(transcript)
          speechService.stop()
          sendToAssistant(transcript)
        } else {
          dispatch({ type: 'INTERIM', text: transcript })
        }
      },
      onEnd: () => {
        // Only act if this session is still the active one (prevents stale onEnd from killing a newer session)
        if (!cancelledRef.current && sessionIdRef.current === sessionId) {
          dispatch({ type: 'IDLE' })
        }
      },
      onError: (_code, message) => {
        if (!cancelledRef.current) {
          dispatch({ type: 'ERROR', message })
        }
      },
    })
  }, [onTranscript, sendToAssistant])

  // Keep ref in sync so sendToAssistant can call startListening without circular dep
  startListeningRef.current = startListening

  // ---------------------------------------------------------------------------
  // Public: activate — entry point for the voice button click
  // ---------------------------------------------------------------------------

  const activate = useCallback(async () => {
    // Only allow starting from idle or error (retry)
    if (state.status !== 'idle' && state.status !== 'error') return

    cancelledRef.current = false

    // Step 1: Request mic permission
    dispatch({ type: 'REQUEST_PERMISSION' })
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      dispatch({ type: 'ERROR', message: 'Microphone permission was denied.' })
      return
    }

    if (cancelledRef.current) return

    // Step 2: Speak the greeting
    dispatch({ type: 'GREETING' })
    try {
      await ttsService.speak(greetingText)
    } catch {
      // TTS failure is non-fatal — continue to listening
    }

    if (cancelledRef.current) return

    // Step 3: Begin listening (or return to idle if toggle is off)
    if (autoListenAfterGreeting) {
      startListening()
    } else {
      dispatch({ type: 'IDLE' })
    }
  }, [state.status, greetingText, autoListenAfterGreeting, startListening])

  // ---------------------------------------------------------------------------
  // Public: cancel — stop everything and return to idle
  // ---------------------------------------------------------------------------

  const cancel = useCallback(() => {
    cancelledRef.current = true
    speechService.abort()
    ttsService.cancel()
    bargeinRef.current?.abort()
    bargeinRef.current = null
    dispatch({ type: 'IDLE' })
  }, [])

  // ---------------------------------------------------------------------------
  // Public: interrupt — cancel TTS mid-speech and immediately start listening
  // ---------------------------------------------------------------------------

  const interrupt = useCallback(() => {
    ttsService.cancel()
    if (!cancelledRef.current) {
      startListeningRef.current?.()
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Public: retry — convenience alias for re-activating after an error
  // ---------------------------------------------------------------------------

  const retry = useCallback(() => {
    dispatch({ type: 'IDLE' })
    // Small delay so the UI can render idle state before activate() runs
    setTimeout(activate, 50)
  }, [activate])

  return {
    status: state.status,
    transcript: state.transcript,
    interimTranscript: state.interimTranscript,
    errorMessage: state.errorMessage,
    activate,
    cancel,
    interrupt,
    retry,
    /** Expose for advanced use-cases (e.g. push-to-talk). */
    startListening,
  }
}
