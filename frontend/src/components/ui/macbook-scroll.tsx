'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MotionValue, motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Sun, SunMedium, LayoutGrid, Search, Mic, Moon,
  SkipBack, FastForward, SkipForward,
  VolumeX, Volume1, Volume2,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Globe, Command,
} from 'lucide-react'

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
  // Start at 0.6 so the closed lid fully covers the static back face
  const scaleY = useTransform(scrollYProgress, [0, 0.3], [0.6, isMobile ? 1 : 1.5])
  // Hold at -80 while closed (0→0.12), then slide open with the hinge (0.12→0.3), then drift off
  const translate = useTransform(scrollYProgress, [0, 0.12, 0.3, 1], [-80, -80, 200, 1500])
  const rotate = useTransform(scrollYProgress, [0.1, 0.12, 0.3], [-28, -28, 0])
  const textTransform = useTransform(scrollYProgress, [0, 0.3], [0, 100])
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  return (
    <div
      ref={ref}
      className="flex min-h-[200vh] flex-col items-center py-0 [perspective:800px] md:pb-60 md:pt-20"
    >
      <motion.h2
        style={{ translateY: textTransform, opacity: textOpacity }}
        className="mb-20 text-center text-3xl font-bold text-foreground"
      >
        {title}
      </motion.h2>

      <Lid src={src} scaleX={scaleX} scaleY={scaleY} rotate={rotate} translate={translate} />

      {/* Base */}
      <div className="relative -z-10 h-[22rem] w-[32rem] overflow-hidden rounded-2xl bg-[#272729]">
        {/* Above-keyboard bar */}
        <div className="relative h-10 w-full">
          <div className="absolute inset-x-0 mx-auto h-4 w-[80%] bg-[#050505]" />
        </div>

        <div className="relative flex">
          {/* Left speaker grill */}
          <div className="mx-auto h-full w-[10%] overflow-hidden">
            <div
              className="mt-2 flex h-40 gap-[2px] px-[0.5px]"
              style={{
                backgroundImage: 'radial-gradient(circle, #08080A 0.5px, transparent 0.5px)',
                backgroundSize: '3px 3px',
              }}
            />
          </div>

          {/* Keyboard */}
          <div className="mx-auto h-full w-[80%]">
            <Keypad />
          </div>

          {/* Right speaker grill */}
          <div className="mx-auto h-full w-[10%] overflow-hidden">
            <div
              className="mt-2 flex h-40 gap-[2px] px-[0.5px]"
              style={{
                backgroundImage: 'radial-gradient(circle, #08080A 0.5px, transparent 0.5px)',
                backgroundSize: '3px 3px',
              }}
            />
          </div>
        </div>

        {/* Trackpad */}
        <div
          className="mx-auto my-1 h-32 w-[40%] rounded-xl"
          style={{ boxShadow: '0px 0px 1px 1px #00000020 inset' }}
        />

        {/* Bottom hinge notch */}
        <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tl-3xl rounded-tr-3xl bg-gradient-to-t from-[#272729] to-[#050505]" />

        {showGradient && (
          <div className="absolute inset-x-0 bottom-0 z-50 h-40 w-full bg-gradient-to-t from-background via-background to-transparent" />
        )}
        {badge && <div className="absolute bottom-4 left-4">{badge}</div>}
      </div>
    </div>
  )
}

// ─── Lid ─────────────────────────────────────────────────────────────────────

const Lid = ({
  scaleX, scaleY, rotate, translate, src,
}: {
  scaleX: MotionValue<number>
  scaleY: MotionValue<number>
  rotate: MotionValue<number>
  translate: MotionValue<number>
  src?: string
}) => (
  <div className="relative [perspective:800px]">
    {/* Static back-face */}
    <div
      style={{
        transform: 'perspective(800px) rotateX(-25deg) translateZ(0px)',
        transformOrigin: 'bottom',
        transformStyle: 'preserve-3d',
      }}
      className="relative h-[12rem] w-[32rem] rounded-2xl bg-[#010101] p-2"
    >
      <div
        style={{ boxShadow: '0px 2px 0px 2px var(--neutral-900) inset' }}
        className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#010101]"
      >
        {/* Apple-style logo placeholder */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-b from-neutral-700 to-neutral-900 flex items-center justify-center">
          <div className="h-5 w-5 rounded-full bg-neutral-800" />
        </div>
      </div>
    </div>

    {/* Animated lid (opens on scroll) */}
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
      <div className="absolute inset-0 rounded-lg bg-[#272729]" />
      {src ? (
        <img
          src={src}
          alt="App preview"
          className="absolute inset-0 h-full w-full rounded-lg object-cover object-left-top"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#0B0B0F] text-xs text-zinc-500">
          No image
        </div>
      )}
    </motion.div>
  </div>
)

// ─── Key button ───────────────────────────────────────────────────────────────

const KBtn = ({
  className,
  childrenClassName,
  backlit = true,
  children,
}: {
  className?: string
  childrenClassName?: string
  backlit?: boolean
  children?: React.ReactNode
}) => (
  <div className={cn('rounded-[4px] p-[0.5px]', backlit && 'bg-white/[0.2] shadow-xl shadow-white')}>
    <div
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-[3.5px] bg-[#0A090D]',
        className,
      )}
      style={{ boxShadow: '0px -0.5px 2px 0 #0D0D0F inset, -0.5px 0px 2px 0 #0D0D0F inset' }}
    >
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center text-[5px] text-neutral-200',
          childrenClassName,
          backlit && 'text-white',
        )}
      >
        {children}
      </div>
    </div>
  </div>
)

// ─── Option icon (SVG) ────────────────────────────────────────────────────────

const OptionIcon = () => (
  <svg fill="none" viewBox="0 0 32 32" className="h-[6px] w-[6px]" stroke="currentColor" strokeWidth={2}>
    <rect x="18" y="5" width="10" height="2" />
    <polygon points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25" />
  </svg>
)

// ─── Keypad ───────────────────────────────────────────────────────────────────

const Keypad = () => (
  <div className="mx-1 h-full rounded-md bg-[#050505] p-1">
    {/* Row 1 — function keys */}
    <div className="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">
      <KBtn className="w-10 items-end justify-start pl-[4px] pb-[2px]" childrenClassName="items-start">esc</KBtn>
      <KBtn><Sun className="h-[6px] w-[6px]" /><span className="mt-1 inline-block">F1</span></KBtn>
      <KBtn><SunMedium className="h-[6px] w-[6px]" /><span className="mt-1 inline-block">F2</span></KBtn>
      <KBtn><LayoutGrid className="h-[6px] w-[6px]" /><span className="mt-1 inline-block">F3</span></KBtn>
      <KBtn><Search className="h-[6px] w-[6px]" /><span className="mt-1 inline-block">F4</span></KBtn>
      <KBtn><Mic className="h-[6px] w-[6px]" /><span className="mt-1 inline-block">F5</span></KBtn>
      <KBtn><Moon className="h-[6px] w-[6px]" /><span className="mt-1 inline-block">F6</span></KBtn>
      <KBtn><SkipBack className="h-[6px] w-[6px]" /><span className="mt-1 inline-block">F7</span></KBtn>
      <KBtn><FastForward className="h-[6px] w-[6px]" /><span className="mt-1 inline-block">F8</span></KBtn>
      <KBtn><SkipForward className="h-[6px] w-[6px]" /><span className="mt-1 inline-block">F9</span></KBtn>
      <KBtn><VolumeX className="h-[6px] w-[6px]" /><span className="mt-1 inline-block">F10</span></KBtn>
      <KBtn><Volume1 className="h-[6px] w-[6px]" /><span className="mt-1 inline-block">F11</span></KBtn>
      <KBtn><Volume2 className="h-[6px] w-[6px]" /><span className="mt-1 inline-block">F12</span></KBtn>
      <KBtn>
        <div className="h-4 w-4 rounded-full bg-gradient-to-b from-neutral-900 from-20% via-black via-50% to-neutral-900 to-95% p-px">
          <div className="h-full w-full rounded-full bg-black" />
        </div>
      </KBtn>
    </div>

    {/* Row 2 — number row */}
    <div className="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">
      <KBtn><span className="block">~</span><span className="mt-1 block">`</span></KBtn>
      <KBtn><span className="block">!</span><span className="block">1</span></KBtn>
      <KBtn><span className="block">@</span><span className="block">2</span></KBtn>
      <KBtn><span className="block">#</span><span className="block">3</span></KBtn>
      <KBtn><span className="block">$</span><span className="block">4</span></KBtn>
      <KBtn><span className="block">%</span><span className="block">5</span></KBtn>
      <KBtn><span className="block">^</span><span className="block">6</span></KBtn>
      <KBtn><span className="block">&amp;</span><span className="block">7</span></KBtn>
      <KBtn><span className="block">*</span><span className="block">8</span></KBtn>
      <KBtn><span className="block">(</span><span className="block">9</span></KBtn>
      <KBtn><span className="block">)</span><span className="block">0</span></KBtn>
      <KBtn><span className="block">—</span><span className="block">_</span></KBtn>
      <KBtn><span className="block">+</span><span className="block">=</span></KBtn>
      <KBtn className="w-10 items-end justify-end pr-[4px] pb-[2px]" childrenClassName="items-end">delete</KBtn>
    </div>

    {/* Row 3 — QWERTY */}
    <div className="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">
      <KBtn className="w-10 items-end justify-start pl-[4px] pb-[2px]" childrenClassName="items-start">tab</KBtn>
      {['Q','W','E','R','T','Y','U','I','O','P'].map(k => (
        <KBtn key={k}><span className="block">{k}</span></KBtn>
      ))}
      <KBtn><span className="block">{'{'}</span><span className="block">{'['}</span></KBtn>
      <KBtn><span className="block">{'}'}</span><span className="block">{']'}</span></KBtn>
      <KBtn><span className="block">{'|'}</span><span className="block">{'\\'}</span></KBtn>
    </div>

    {/* Row 4 — ASDF */}
    <div className="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">
      <KBtn className="w-[2.8rem] items-end justify-start pl-[4px] pb-[2px]" childrenClassName="items-start">caps lock</KBtn>
      {['A','S','D','F','G','H','J','K','L'].map(k => (
        <KBtn key={k}><span className="block">{k}</span></KBtn>
      ))}
      <KBtn><span className="block">:</span><span className="block">;</span></KBtn>
      <KBtn><span className="block">&quot;</span><span className="block">&apos;</span></KBtn>
      <KBtn className="w-[2.85rem] items-end justify-end pr-[4px] pb-[2px]" childrenClassName="items-end">return</KBtn>
    </div>

    {/* Row 5 — ZXCV */}
    <div className="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">
      <KBtn className="w-[3.65rem] items-end justify-start pl-[4px] pb-[2px]" childrenClassName="items-start">shift</KBtn>
      {['Z','X','C','V','B','N','M'].map(k => (
        <KBtn key={k}><span className="block">{k}</span></KBtn>
      ))}
      <KBtn><span className="block">&lt;</span><span className="block">,</span></KBtn>
      <KBtn><span className="block">&gt;</span><span className="block">.</span></KBtn>
      <KBtn><span className="block">?</span><span className="block">/</span></KBtn>
      <KBtn className="w-[3.65rem] items-end justify-end pr-[4px] pb-[2px]" childrenClassName="items-end">shift</KBtn>
    </div>

    {/* Row 6 — bottom row */}
    <div className="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">
      <KBtn childrenClassName="h-full justify-between py-[4px]">
        <div className="flex w-full justify-end pr-1"><span>fn</span></div>
        <div className="flex w-full justify-start pl-1"><Globe className="h-[6px] w-[6px]" /></div>
      </KBtn>
      <KBtn childrenClassName="h-full justify-between py-[4px]">
        <div className="flex w-full justify-end pr-1"><ChevronUp className="h-[6px] w-[6px]" /></div>
        <div className="flex w-full justify-start pl-1"><span>control</span></div>
      </KBtn>
      <KBtn childrenClassName="h-full justify-between py-[4px]">
        <div className="flex w-full justify-end pr-1"><OptionIcon /></div>
        <div className="flex w-full justify-start pl-1"><span>option</span></div>
      </KBtn>
      <KBtn className="w-8" childrenClassName="h-full justify-between py-[4px]">
        <div className="flex w-full justify-end pr-1"><Command className="h-[6px] w-[6px]" /></div>
        <div className="flex w-full justify-start pl-1"><span>command</span></div>
      </KBtn>
      {/* Spacebar */}
      <KBtn className="w-[8.2rem]" />
      <KBtn className="w-8" childrenClassName="h-full justify-between py-[4px]">
        <div className="flex w-full justify-start pl-1"><Command className="h-[6px] w-[6px]" /></div>
        <div className="flex w-full justify-start pl-1"><span>command</span></div>
      </KBtn>
      <KBtn childrenClassName="h-full justify-between py-[4px]">
        <div className="flex w-full justify-start pl-1"><OptionIcon /></div>
        <div className="flex w-full justify-start pl-1"><span>option</span></div>
      </KBtn>
      {/* Arrow cluster */}
      <div className="mt-[2px] flex h-6 w-[4.9rem] flex-col items-center justify-end rounded-[4px] p-[0.5px]">
        <KBtn className="w-6 h-3"><ChevronUp className="h-[6px] w-[6px]" /></KBtn>
        <div className="flex">
          <KBtn className="w-6 h-3"><ChevronLeft className="h-[6px] w-[6px]" /></KBtn>
          <KBtn className="w-6 h-3"><ChevronDown className="h-[6px] w-[6px]" /></KBtn>
          <KBtn className="w-6 h-3"><ChevronRight className="h-[6px] w-[6px]" /></KBtn>
        </div>
      </div>
    </div>
  </div>
)
