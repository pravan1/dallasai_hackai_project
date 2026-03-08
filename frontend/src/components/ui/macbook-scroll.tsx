'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MotionValue, motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

export const MacbookScroll = ({
  src,
  showGradient,
  title,
  badge,
}: {
  src?: string
  showGradient?: boolean
  title?: string | React.ReactNode
  badge?: React.ReactNode
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const scaleX = useTransform(scrollYProgress, [0, 0.3], [1.2, isMobile ? 1 : 1.5])
  const scaleY = useTransform(scrollYProgress, [0, 0.3], [0.6, isMobile ? 1 : 1.5])
  const translate = useTransform(scrollYProgress, [0, 1], [0, 1500])
  const rotate = useTransform(scrollYProgress, [0.1, 0.12, 0.3], [-28, -28, 0])
  const textTransform = useTransform(scrollYProgress, [0, 0.3], [0, 100])
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  return (
    <div
      ref={ref}
      className="flex min-h-[200vh] flex-col items-center py-0 [perspective:800px] sm:py-80"
    >
      {/* Title */}
      <motion.h2
        style={{ translateY: textTransform, opacity: textOpacity }}
        className="mb-20 text-center text-3xl font-bold text-foreground"
      >
        {title}
      </motion.h2>

      {/* MacBook lid */}
      <Lid src={src} scaleX={scaleX} scaleY={scaleY} rotate={rotate} translate={translate} />

      {/* Base */}
      <div className="relative -z-10 h-[22rem] w-[32rem] overflow-hidden rounded-2xl bg-[#272729] [mask-image:linear-gradient(to_bottom,black_50%,transparent)]">
        {/* notch */}
        <div className="mx-auto mt-1 h-40 w-[12.5rem] rounded-[3px] bg-[#050505]" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto flex h-96 w-full items-end justify-center rounded-2xl">
          {/* keyboard rows */}
          <KeyRows />
        </div>
      </div>

      {showGradient && (
        <div className="absolute inset-x-0 bottom-0 z-50 h-40 w-full bg-gradient-to-t from-background via-background to-transparent" />
      )}
      {badge && <div className="absolute bottom-4 left-4">{badge}</div>}
    </div>
  )
}

const Lid = ({
  scaleX,
  scaleY,
  rotate,
  translate,
  src,
}: {
  scaleX: MotionValue<number>
  scaleY: MotionValue<number>
  rotate: MotionValue<number>
  translate: MotionValue<number>
  src?: string
}) => {
  return (
    <div className="relative [perspective:800px]">
      {/* Lid top face */}
      <div
        style={{
          transform: 'perspective(800px) rotateX(-25deg) translateZ(0px)',
          transformOrigin: 'bottom',
          transformStyle: 'preserve-3d',
        }}
        className="relative h-[12rem] w-[32rem] rounded-2xl bg-[#010101] p-2"
      >
        <div
          style={{ boxShadow: '0px 2px 0px 2px var(--neutral-900)' }}
          className="absolute inset-0 rounded-2xl bg-[#010101]"
        />
        <div className="relative z-10 h-full w-full overflow-hidden rounded-xl bg-[#0B0B0F]">
          {/* App screenshot fills the screen */}
          {src ? (
            <img
              src={src}
              alt="App preview"
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#0B0B0F] text-xs text-zinc-500">
              No image
            </div>
          )}
        </div>
      </div>

      {/* Animated lid opener */}
      <motion.div
        style={{
          scaleX,
          scaleY,
          rotateX: rotate,
          translateY: translate,
          transformStyle: 'preserve-3d',
          transformOrigin: 'top',
        }}
        className="absolute inset-0 h-96 w-[32rem] rounded-2xl bg-[#010101] p-2"
      >
        <div className="absolute inset-0 rounded-2xl bg-[#272729]" />
        <div className="relative z-10 h-full w-full overflow-hidden rounded-xl bg-[#0B0B0F]">
          {src ? (
            <img
              src={src}
              alt="App preview"
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#0B0B0F] text-xs text-zinc-500">
              No image
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

const KeyRows = () => (
  <div className="w-full px-10 pb-8 space-y-1">
    {[8, 9, 9, 8, 6].map((count, row) => (
      <div key={row} className="flex justify-center gap-1">
        {Array.from({ length: count }).map((_, i) => (
          <Key key={i} />
        ))}
      </div>
    ))}
  </div>
)

const Key = () => (
  <div
    className="h-5 w-10 rounded-[2px] bg-[#1a1a1a]"
    style={{ boxShadow: '0px 1px 1px rgba(255,255,255,0.05) inset' }}
  />
)
