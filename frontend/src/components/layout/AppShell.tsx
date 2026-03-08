'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Hand, Mic } from 'lucide-react'
import { Button as MovingButton } from '@/components/ui/moving-border'
import { GestureOverlay } from '@/components/gesture/GestureOverlay'
import PillNav from '@/components/nav/PillNav'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant'

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
  const [handsFreeVoiceEnabled, setHandsFreeVoiceEnabled] = useState(false)
  const [accessToken, setAccessToken] = useState<string>('')
  const { user } = useUser()

  // Fetch the Auth0 access token once on mount
  useEffect(() => {
    fetch('/api/auth/token')
      .then(r => r.json())
      .then(d => { if (d.token) setAccessToken(d.token) })
      .catch(() => {})
  }, [])

  const firstName = user?.given_name ?? user?.nickname ?? user?.name?.split(' ')[0]
  const userId = user?.sub ?? 'anonymous'

  const voice = useVoiceAssistant({
    firstName,
    accessToken,
    userId,
    autoListenAfterReply: handsFreeVoiceEnabled,
    keepListeningOnEnd: handsFreeVoiceEnabled,
  })

  const voiceActive = voice.status !== 'idle' && voice.status !== 'error'

  const handleVoiceToggle = () => {
    if (handsFreeVoiceEnabled) {
      setHandsFreeVoiceEnabled(false)
      voice.cancel()
      return
    }

    setHandsFreeVoiceEnabled(true)
    if (voice.status === 'speaking') {
      voice.interrupt()
    } else if (!voiceActive) {
      voice.activate()
    }
  }

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
              onClick={handleVoiceToggle}
              duration={voiceActive ? 1400 : 3000}
              containerClassName="h-7 w-auto"
              borderClassName={voiceActive ? 'bg-[radial-gradient(#60a5fa_40%,transparent_60%)] opacity-100' : undefined}
              className="gap-1.5 px-3 text-xs font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              <Mic className="h-3.5 w-3.5" />
              {handsFreeVoiceEnabled
                ? voice.status === 'listening'
                  ? 'Listening…'
                  : voice.status === 'speaking'
                    ? 'Speaking…'
                    : voice.status === 'processing'
                      ? 'Thinking…'
                      : 'Voice ON'
                : 'Voice OFF'}
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
