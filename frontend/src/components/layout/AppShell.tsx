'use client'

import { useState } from 'react'
import { Hand, Mic, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GestureOverlay } from '@/components/gesture/GestureOverlay'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [gestureEnabled, setGestureEnabled] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top navigation */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LearnFlow
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={voiceEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              Voice {voiceEnabled ? 'ON' : 'OFF'}
            </Button>

            <Button
              variant={gestureEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGestureEnabled(!gestureEnabled)}
              className="gap-2"
            >
              <Hand className="h-4 w-4" />
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
