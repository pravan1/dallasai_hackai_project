'use client'

import { useState } from 'react'
import { Sparkles, Hand, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
              logoAlt="LearnFlow"
              items={NAV_ITEMS}
              baseColor="#0d0d0d"
              pillColor="#1a1a1a"
              hoveredPillTextColor="#80b8f5"
              pillTextColor="#707070"
            />
          </div>

          {/* Right-side action buttons */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant={voiceEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="gap-1.5 h-7 text-xs"
            >
              <Mic className="h-3.5 w-3.5" />
              Voice {voiceEnabled ? 'ON' : 'OFF'}
            </Button>

            <Button
              variant={gestureEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGestureEnabled(!gestureEnabled)}
              className="gap-1.5 h-7 text-xs"
            >
              <Hand className="h-3.5 w-3.5" />
              Gesture {gestureEnabled ? 'ON' : 'OFF'}
            </Button>
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
