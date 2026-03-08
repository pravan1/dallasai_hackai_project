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
import type { VoiceAssistantState, Message } from '@/types'

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
  /** If true, automatically restart STT when browser unexpectedly ends listening. */
  keepListeningOnEnd?: boolean
  /** Auth0 access token. Required for API calls. */
  accessToken?: string
  /** Auth0 user sub / internal user ID. Required for API calls. */
  userId?: string
  /** Conversation ID for chat history. Optional. */
  conversationId?: string
  /** Called with the final user transcript when speech recognition finishes. */
  onTranscript?: (text: string) => void
  /** Called with the assistant's text reply (for TTS or display). */
  onResponse?: (text: string) => void
  /** Called with full messages when voice API completes — use to add to chat UI without duplicate API call. */
  onVoiceComplete?: (userMessage: Message, assistantMessage: Message) => void
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
    keepListeningOnEnd = false,
    accessToken,
    userId,
    conversationId,
    onTranscript,
    onResponse,
    onVoiceComplete,
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
  // Track no-speech retries — give user a second chance instead of failing immediately
  const noSpeechRetryRef = useRef(0)
  // True while we are waiting for a final transcript in the current STT session.
  const awaitingFinalRef = useRef(false)

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

  /**
   * Guard against browsers that occasionally never fire onend for speechSynthesis.
   * If that happens, we still advance the state machine after a timeout.
   */
  async function speakWithTimeout(text: string, timeoutMs: number) {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      await Promise.race([
        ttsService.speak(text),
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, timeoutMs)
        }),
      ])
    } finally {
      if (timer) clearTimeout(timer)
    }
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
          { message: transcript, userId, inputMode: 'voice', conversationId },
          accessToken ?? ''
        )

        if (cancelledRef.current) return

        const replyText = result.assistantMessage.content
        onResponse?.(replyText)
        onVoiceComplete?.(result.userMessage, result.assistantMessage)

        if (voiceRepliesEnabled) {
          dispatch({ type: 'SPEAKING' })
          bargedInRef.current = false
          startBargeinListener()
          const replyTimeoutMs = Math.min(12000, Math.max(4000, replyText.length * 55))
          await speakWithTimeout(replyText, replyTimeoutMs)
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
    [accessToken, userId, conversationId, voiceRepliesEnabled, autoListenAfterReply, onResponse, onVoiceComplete]
  )

  // ---------------------------------------------------------------------------
  // Internal: start speech recognition
  // ---------------------------------------------------------------------------

  const startListening = useCallback(() => {
    if (cancelledRef.current) return

    // Each session gets a unique ID — stale onEnd callbacks from old sessions are ignored
    const sessionId = ++sessionIdRef.current
    awaitingFinalRef.current = true

    // #region agent log
    fetch('http://127.0.0.1:7743/ingest/49669d22-4eb1-4d42-8256-9ad78e844650',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f54c0a'},body:JSON.stringify({sessionId:'f54c0a',location:'useVoiceAssistant.ts:startListening',message:'startListening called',data:{sessionId,keepListeningOnEnd,cancelled:cancelledRef.current,origin:window.location.origin},timestamp:Date.now(),hypothesisId:'H1-H3'})}).catch(()=>{});
    // #endregion

    dispatch({ type: 'LISTEN' })

    speechService.start({
      continuous: true,
      interimResults: true,
      onResult: ({ transcript, isFinal }) => {
        // #region agent log
        fetch('http://127.0.0.1:7743/ingest/49669d22-4eb1-4d42-8256-9ad78e844650',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f54c0a'},body:JSON.stringify({sessionId:'f54c0a',location:'useVoiceAssistant.ts:onResult',message:'STT result',data:{transcript,isFinal,sessionId},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        if (isFinal) {
          awaitingFinalRef.current = false
          noSpeechRetryRef.current = 0 // Reset retry count on success
          dispatch({ type: 'FINAL', text: transcript })
          onTranscript?.(transcript)
          speechService.stop()
          sendToAssistant(transcript)
        } else {
          dispatch({ type: 'INTERIM', text: transcript })
        }
      },
      onEnd: () => {
        // #region agent log
        fetch('http://127.0.0.1:7743/ingest/49669d22-4eb1-4d42-8256-9ad78e844650',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f54c0a'},body:JSON.stringify({sessionId:'f54c0a',location:'useVoiceAssistant.ts:onEnd',message:'STT onEnd fired',data:{sessionId,currentSessionId:sessionIdRef.current,awaitingFinal:awaitingFinalRef.current,keepListeningOnEnd,cancelled:cancelledRef.current},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        // Only act if this session is still the active one (prevents stale onEnd from killing a newer session)
        if (!cancelledRef.current && sessionIdRef.current === sessionId) {
          // In hands-free mode, browser STT may end without a final result; auto-restart listening.
          if (keepListeningOnEnd && awaitingFinalRef.current) {
            setTimeout(() => {
              if (!cancelledRef.current) startListeningRef.current?.()
            }, 250)
            return
          }
          dispatch({ type: 'IDLE' })
        }
      },
      onError: (code, message) => {
        // #region agent log
        fetch('http://127.0.0.1:7743/ingest/49669d22-4eb1-4d42-8256-9ad78e844650',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f54c0a'},body:JSON.stringify({sessionId:'f54c0a',location:'useVoiceAssistant.ts:onError',message:'STT error',data:{code,errorMessage:message,sessionId,keepListeningOnEnd,awaitingFinal:awaitingFinalRef.current},timestamp:Date.now(),hypothesisId:'H1-H4'})}).catch(()=>{});
        // #endregion
        if (!cancelledRef.current) {
          // Hands-free mode: keep microphone loop alive on silence/timeouts.
          if (keepListeningOnEnd && (code === 'no-speech' || code === 'aborted')) {
            setTimeout(() => {
              if (!cancelledRef.current) startListeningRef.current?.()
            }, 250)
            return
          }
          // Give user a second chance on "no speech" — they may have been slow to respond after greeting
          if (code === 'no-speech' && noSpeechRetryRef.current < 1) {
            noSpeechRetryRef.current++
            startListeningRef.current?.()
          } else {
            noSpeechRetryRef.current = 0
            dispatch({ type: 'ERROR', message })
          }
        }
      },
    })
  }, [onTranscript, sendToAssistant, keepListeningOnEnd])

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
      await speakWithTimeout(greetingText, 3500)
    } catch {
      // TTS failure is non-fatal — continue to listening
    }

    if (cancelledRef.current) return

    // Step 3: Begin listening (or return to idle if toggle is off)
    // Brief delay avoids mic picking up speaker echo from the greeting
    if (autoListenAfterGreeting) {
      noSpeechRetryRef.current = 0
      setTimeout(() => {
        if (!cancelledRef.current) startListening()
      }, 400)
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
