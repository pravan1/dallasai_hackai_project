'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Hand, Mic, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GestureOverlay } from '@/components/gesture/GestureOverlay'
import { useGesture } from '@/hooks/useGesture'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [gestureEnabled, setGestureEnabled] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  const { lastGesture } = useGesture((gesture) => {
    console.log('Gesture detected:', gesture)
  }, gestureEnabled)

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
              title="Back to home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm text-primary">LearnFlow</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>

      {gestureEnabled && <GestureOverlay />}
    </div>
  )
}
