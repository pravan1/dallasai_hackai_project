'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface HandsFreeState {
  enabled: boolean
  toggle: () => void
  voiceStatus: string
  setVoiceStatus: (s: string) => void
}

const HandsFreeContext = createContext<HandsFreeState>({
  enabled: false,
  toggle: () => {},
  voiceStatus: 'idle',
  setVoiceStatus: () => {},
})

export function HandsFreeProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('idle')

  const toggle = useCallback(() => setEnabled(prev => !prev), [])

  return (
    <HandsFreeContext.Provider value={{ enabled, toggle, voiceStatus, setVoiceStatus }}>
      {children}
    </HandsFreeContext.Provider>
  )
}

export function useHandsFree() {
  return useContext(HandsFreeContext)
}
