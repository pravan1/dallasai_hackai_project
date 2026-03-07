'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Gesture } from '@/types'

export function useGesture(
  onGesture: (gesture: Gesture) => void,
  isActive: boolean = false
) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [lastGesture, setLastGesture] = useState<Gesture | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastGestureTimeRef = useRef<number>(0)
  const previousHandXRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const COOLDOWN_MS = 1000 // 1 second cooldown
  const SWIPE_THRESHOLD = 0.2 // 20% of screen width

  // Initialize camera and gesture detection
  useEffect(() => {
    if (!isActive) return

    let handLandmarker: any = null

    async function initGesture() {
      try {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        })
        streamRef.current = stream
        setHasPermission(true)

        // Create video element if not exists
        if (!videoRef.current) {
          videoRef.current = document.createElement('video')
          videoRef.current.autoplay = true
          videoRef.current.playsInline = true
        }

        videoRef.current.srcObject = stream

        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve
          }
        })

        // Start gesture detection loop
        detectGesture()
      } catch (error) {
        console.error('Gesture init failed:', error)
        setHasPermission(false)
      }
    }

    function detectGesture() {
      if (!videoRef.current || !isActive) return

      // Simple gesture detection based on video frame
      // In production, you would use MediaPipe Hands here
      // For MVP, we'll use a simplified version

      const video = videoRef.current

      // TODO: Integrate MediaPipe Hands for actual hand tracking
      // For now, this is a placeholder that demonstrates the structure

      animationFrameRef.current = requestAnimationFrame(detectGesture)
    }

    if (isActive) {
      initGesture()
    }

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [isActive])

  // Simulate gesture for testing
  const simulateGesture = useCallback(
    (gesture: Gesture) => {
      const now = Date.now()
      if (now - lastGestureTimeRef.current < COOLDOWN_MS) return

      setLastGesture(gesture)
      onGesture(gesture)
      lastGestureTimeRef.current = now

      // Clear after 2 seconds
      setTimeout(() => setLastGesture(null), 2000)
    },
    [onGesture, COOLDOWN_MS]
  )

  return {
    hasPermission,
    lastGesture,
    videoRef,
    simulateGesture, // For testing
  }
}

// Note: Full MediaPipe Hands implementation
/*
To implement full MediaPipe Hands:

1. Install: @mediapipe/tasks-vision
2. Import: import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
3. Initialize:
   const vision = await FilesetResolver.forVisionTasks(
     'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
   )
   const handLandmarker = await HandLandmarker.createFromOptions(vision, {
     baseOptions: {
       modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
       delegate: 'GPU'
     },
     numHands: 1,
     runningMode: 'VIDEO'
   })
4. Detect:
   const results = handLandmarker.detectForVideo(video, performance.now())
   if (results.landmarks && results.landmarks.length > 0) {
     const hand = results.landmarks[0]
     // Track wrist (hand[0]) movement for swipe detection
   }
*/
