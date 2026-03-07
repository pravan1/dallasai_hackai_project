'use client'

/**
 * useGestureNavigation — MediaPipe Hand Landmarker + keyboard fallback
 *
 * Enabled only when the `enabled` prop is true (webcam is never opened otherwise).
 * Detects left-to-right hand swipe as NEXT, right-to-left as BACK.
 * Falls back to ArrowRight / ArrowLeft keyboard shortcuts regardless of gesture mode.
 *
 * MediaPipe is loaded dynamically to prevent Next.js SSR from breaking.
 * The hook exposes videoRef so callers can render a <video> element for preview.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { GestureAction } from '@/types'

export interface GestureNavigationOptions {
  /** Called when a NEXT gesture or ArrowRight key is detected. */
  onNext: () => void
  /** Called when a BACK gesture or ArrowLeft key is detected. */
  onBack: () => void
  /** Set to true to request webcam access and start MediaPipe. Default: false. */
  enabled?: boolean
  /**
   * Minimum milliseconds between two gesture triggers.
   * Prevents accidental repeated triggers. Default: 1000.
   */
  cooldownMs?: number
  /**
   * Minimum normalised X delta (0–1) for a swipe to register.
   * Higher = less sensitive. Default: 0.15.
   */
  swipeThreshold?: number
}

export function useGestureNavigation({
  onNext,
  onBack,
  enabled = false,
  cooldownMs = 1000,
  swipeThreshold = 0.15,
}: GestureNavigationOptions) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [lastGesture, setLastGesture] = useState<GestureAction>(null)

  // Exposed so callers can attach to a <video> element for preview
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const handLandmarkerRef = useRef<any>(null)
  const animationFrameRef = useRef<number | null>(null)

  // For swipe detection: track previous wrist X across frames
  const prevWristXRef = useRef<number | null>(null)
  const lastGestureTimeRef = useRef<number>(0)

  // ---------------------------------------------------------------------------
  // Trigger helper — enforces cooldown, fires callback, shows toast state
  // ---------------------------------------------------------------------------

  const triggerGesture = useCallback(
    (gesture: GestureAction) => {
      if (!gesture) return
      const now = Date.now()
      if (now - lastGestureTimeRef.current < cooldownMs) return

      lastGestureTimeRef.current = now
      setLastGesture(gesture)
      if (gesture === 'NEXT') onNext()
      else onBack()

      // Clear the visible toast after 1.5 s
      setTimeout(() => setLastGesture(null), 1500)
    },
    [onNext, onBack, cooldownMs]
  )

  // ---------------------------------------------------------------------------
  // Keyboard fallback — active regardless of gesture mode
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') triggerGesture('NEXT')
      if (e.key === 'ArrowLeft') triggerGesture('BACK')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [triggerGesture])

  // ---------------------------------------------------------------------------
  // MediaPipe gesture detection — only when enabled === true
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function init() {
      try {
        // 1. Request webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        })

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream
        setHasPermission(true)

        // 2. Attach to a hidden video element
        const video = document.createElement('video')
        video.autoplay = true
        video.playsInline = true
        video.muted = true
        video.srcObject = stream
        videoRef.current = video

        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => resolve()
        })

        if (cancelled) return

        // 3. Load MediaPipe dynamically (avoids SSR / bundle issues)
        const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision')

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
        )

        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          numHands: 1,
          runningMode: 'VIDEO',
        })

        if (cancelled) return

        detectLoop()
      } catch {
        if (!cancelled) {
          setHasPermission(false)
        }
      }
    }

    function detectLoop() {
      if (cancelled || !handLandmarkerRef.current || !videoRef.current) return

      const results = handLandmarkerRef.current.detectForVideo(
        videoRef.current,
        performance.now()
      )

      if (results.landmarks && results.landmarks.length > 0) {
        // Landmark 0 is the wrist. X is normalised 0–1 (left-to-right in camera space).
        const wristX: number = results.landmarks[0][0].x

        if (prevWristXRef.current !== null) {
          const delta = wristX - prevWristXRef.current
          // Camera is mirrored: moving hand RIGHT increases X → user sees it as NEXT
          if (delta > swipeThreshold) triggerGesture('NEXT')
          else if (delta < -swipeThreshold) triggerGesture('BACK')
        }

        prevWristXRef.current = wristX
      } else {
        // No hand in frame — reset so next appearance doesn't produce a false delta
        prevWristXRef.current = null
      }

      animationFrameRef.current = requestAnimationFrame(detectLoop)
    }

    init()

    return () => {
      cancelled = true
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
      handLandmarkerRef.current?.close?.()
      handLandmarkerRef.current = null
      prevWristXRef.current = null
      setHasPermission(null)
    }
  }, [enabled, triggerGesture, swipeThreshold])

  return {
    /** null = not yet requested, true = granted, false = denied */
    hasPermission,
    /** The gesture that just fired (shown in toast). Clears after 1.5 s. */
    lastGesture,
    /**
     * Ref to the hidden video element. Assign to a <video> element's ref
     * if you want to show a live webcam preview in the UI.
     *
     * Example:
     *   <video ref={(el) => { if (el && videoRef.current) el.srcObject = videoRef.current.srcObject }} />
     */
    videoRef,
  }
}
