'use client'

import { useState, useEffect, useRef } from 'react'
import Orb from './Orb'

interface FloatingOrbProps {
  isActive?: boolean
  size?: number
  className?: string
  baseHue?: number
  floating?: boolean
}

// App dark background color in hex
const APP_BG = '#0d0d0d'

export function FloatingOrb({
  isActive = false,
  size = 200,
  className = '',
  baseHue = 15,
  floating = true,
}: FloatingOrbProps) {
  const [hue, setHue] = useState(baseHue)
  const hueRef = useRef(baseHue)
  const lastTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    lastTimeRef.current = null

    if (!isActive) {
      // Smoothly drift back to base hue
      const returnToBase = (time: number) => {
        if (lastTimeRef.current === null) lastTimeRef.current = time
        const diff = baseHue - hueRef.current
        if (Math.abs(diff) > 0.3) {
          hueRef.current += diff * 0.04
          setHue(Math.round(hueRef.current))
          rafRef.current = requestAnimationFrame(returnToBase)
        } else {
          hueRef.current = baseHue
          setHue(baseHue)
        }
      }
      rafRef.current = requestAnimationFrame(returnToBase)
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    }

    // Oscillate hue within the blue/teal/indigo band when active
    const RANGE = 50 // ±50° keeps us in blue → teal → indigo
    const SPEED = 0.03
    const cycle = (time: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = time
      const dt = time - lastTimeRef.current
      lastTimeRef.current = time
      hueRef.current += dt * SPEED
      const oscillated = baseHue + Math.sin(hueRef.current * 0.001) * RANGE
      setHue(Math.round(oscillated))
      rafRef.current = requestAnimationFrame(cycle)
    }
    rafRef.current = requestAnimationFrame(cycle)

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isActive, baseHue])

  return (
    <div
      className={`${floating ? (isActive ? 'orb-floating-active' : 'orb-floating') : ''} ${className}`}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <Orb
        hue={hue}
        hoverIntensity={isActive ? 1.4 : 0.3}
        rotateOnHover={false}
        forceHoverState={isActive}
        backgroundColor={APP_BG}
      />
    </div>
  )
}
