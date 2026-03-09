'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VoiceButton } from './VoiceButton'

interface ChatInputProps {
  onSend: (content: string, mode: 'voice' | 'text') => void
  onVoiceComplete?: (userMessage: import('@/types').Message, assistantMessage: import('@/types').Message) => void
  conversationId?: string
  disabled?: boolean
}

export function ChatInput({ onSend, onVoiceComplete, conversationId, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || disabled) return

    onSend(input, 'text')
    setInput('')
  }

  const handleVoiceResponse = (text: string) => {
    // Voice response callback - the VoiceButton handles TTS automatically
    // Just update the chat input field if needed
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything or use voice..."
          disabled={disabled}
          className="flex-1"
        />

        <VoiceButton
          firstName={undefined}
          voiceRepliesEnabled={true}
          preferBritishVoice={false}
          autoListenAfterGreeting={true}
          autoListenAfterReply={true}
          keepListeningOnEnd={true}
          userId="anonymous"
          conversationId={conversationId}
          onTranscript={(text) => setInput(text)}
          onResponse={handleVoiceResponse}
          onVoiceComplete={onVoiceComplete}
        />

        <Button type="submit" size="icon" disabled={!input.trim() || disabled}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
