'use client'

import { useState } from 'react'
import { Send, Mic, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VoiceRecorder } from './VoiceRecorder'
import { useVoice } from '@/hooks/useVoice'

interface ChatInputProps {
  onSend: (content: string, mode: 'voice' | 'text') => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const { isRecording, transcript, startRecording, stopRecording } = useVoice()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || disabled) return

    onSend(input, 'text')
    setInput('')
  }

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording()
      if (transcript.trim()) {
        onSend(transcript, 'voice')
      }
    } else {
      startRecording()
    }
  }

  return (
    <div className="space-y-3">
      {isRecording && <VoiceRecorder transcript={transcript} />}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isRecording ? 'Listening...' : 'Ask me anything...'}
          disabled={disabled || isRecording}
          className="flex-1"
        />

        <Button
          type="button"
          size="icon"
          variant={isRecording ? 'destructive' : 'outline'}
          onClick={handleVoiceToggle}
          disabled={disabled}
          className={isRecording ? 'animate-pulse-glow' : ''}
        >
          {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        <Button type="submit" size="icon" disabled={!input.trim() || disabled}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
