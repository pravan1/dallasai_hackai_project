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
    accessToken,
    userId,
    onTranscript,
    onResponse,
  } = options

  const [state, dispatch] = useReducer(reducer, initialState)

  // Lets async flows know when the user has cancelled mid-flow
  const cancelledRef = useRef(false)

  const greetingText = firstName
    ? `Hey ${firstName}, what would you like to learn today?`
    : `Hey there, what would you like to learn today?`

  // ---------------------------------------------------------------------------
  // Internal: send transcript to API and optionally speak the reply
  // ---------------------------------------------------------------------------

  const sendToAssistant = useCallback(
    async (transcript: string) => {
      if (cancelledRef.current) return

      if (!accessToken || !userId) {
        // No auth configured — skip API call, just surface the transcript
        dispatch({ type: 'IDLE' })
        return
      }

      dispatch({ type: 'PROCESSING' })

      try {
        const result = await assistantApiClient.chat(
          { message: transcript, userId, inputMode: 'voice' },
          accessToken
        )

        if (cancelledRef.current) return

        const replyText = result.assistantMessage.content
        onResponse?.(replyText)

        if (voiceRepliesEnabled) {
          dispatch({ type: 'SPEAKING' })
          await ttsService.speak(replyText)
        }

        if (!cancelledRef.current) dispatch({ type: 'IDLE' })
      } catch {
        if (!cancelledRef.current) {
          dispatch({ type: 'ERROR', message: 'Failed to get a response. Please try again.' })
        }
      }
    },
    [accessToken, userId, voiceRepliesEnabled, onResponse]
  )

  // ---------------------------------------------------------------------------
  // Internal: start speech recognition
  // ---------------------------------------------------------------------------

  const startListening = useCallback(() => {
    if (cancelledRef.current) return

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
        // onEnd fires after onResult(isFinal) so only acts if nothing resolved yet
        if (!cancelledRef.current) {
          dispatch({ type: 'IDLE' })
        }
      },
      onError: (code, message) => {
        if (!cancelledRef.current) {
          dispatch({ type: 'ERROR', message })
        }
      },
    })
  }, [onTranscript, sendToAssistant])

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
    dispatch({ type: 'IDLE' })
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
    retry,
    /** Expose for advanced use-cases (e.g. push-to-talk). */
    startListening,
  }
}
