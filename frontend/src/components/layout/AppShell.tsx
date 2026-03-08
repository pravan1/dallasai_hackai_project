'use client'

import { useState } from 'react'
import { Sparkles, Hand, Mic } from 'lucide-react'
import { Button as MovingButton } from '@/components/ui/moving-border'
import { GestureOverlay } from '@/components/gesture/GestureOverlay'
import PillNav from '@/components/nav/PillNav'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Learn', href: '/learn' },
]

const LOGO_NODE = (
  <div className="flex items-center justify-center w-full h-full">
    <Sparkles style={{ width: 18, height: 18, color: '#80b8f5' }} />
  </div>
)

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [gestureEnabled, setGestureEnabled] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
        <div className="relative flex items-center justify-between h-14 px-4">
          {/* Centered pill nav */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <PillNav
              logoNode={LOGO_NODE}
              logoAlt="jarvis.ai"
              items={NAV_ITEMS}
              baseColor="#0d0d0d"
              pillColor="#1a1a1a"
              hoveredPillTextColor="#80b8f5"
              pillTextColor="#707070"
            />
          </div>

          {/* Right-side action buttons */}
          <div className="ml-auto flex items-center gap-2">
            <MovingButton
              borderRadius="0.6rem"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              duration={voiceEnabled ? 1400 : 3000}
              containerClassName="h-7 w-auto"
              borderClassName={voiceEnabled ? 'bg-[radial-gradient(#60a5fa_40%,transparent_60%)] opacity-100' : undefined}
              className="gap-1.5 px-3 text-xs font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              <Mic className="h-3.5 w-3.5" />
              Voice {voiceEnabled ? 'ON' : 'OFF'}
            </MovingButton>

            <MovingButton
              borderRadius="0.6rem"
              onClick={() => setGestureEnabled(!gestureEnabled)}
              duration={gestureEnabled ? 1400 : 3000}
              containerClassName="h-7 w-auto"
              borderClassName={gestureEnabled ? 'bg-[radial-gradient(#60a5fa_40%,transparent_60%)] opacity-100' : undefined}
              className="gap-1.5 px-3 text-xs font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              <Hand className="h-3.5 w-3.5" />
              Gesture {gestureEnabled ? 'ON' : 'OFF'}
            </MovingButton>
          </div>
        </div>
      </header>

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">{children}</div>

      {/* Gesture overlay — webcam only opens when gestureEnabled */}
      <GestureOverlay
        enabled={gestureEnabled}
        onNext={() => console.log('gesture: NEXT')}
        onBack={() => console.log('gesture: BACK')}
      />
    </div>
  )
}
