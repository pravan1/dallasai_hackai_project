'use client'

import { Bot, User, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'
import { formatTime } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-primary' : 'bg-secondary'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-foreground" />
        )}
      </div>

      {/* Message content */}
      <div className={cn('flex-1 space-y-2', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'rounded-lg px-4 py-2 max-w-[80%]',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-foreground'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatTime(message.createdAt)}</span>
          {message.inputMode === 'voice' && <span>• Voice</span>}
        </div>

        {/* Sources cited */}
        {!isUser && message.metadata?.sourcesCited && message.metadata.sourcesCited.length > 0 && (
          <div className="space-y-1 max-w-[80%]">
            <p className="text-xs text-muted-foreground">Sources:</p>
            {message.metadata.sourcesCited.map((source, index) => (
              <div
                key={index}
                className="bg-secondary/50 rounded px-2 py-1 text-xs flex items-start gap-2"
              >
                <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{source.title}</div>
                  <div className="text-muted-foreground line-clamp-2">
                    {source.snippet}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggested questions */}
        {!isUser && message.metadata?.suggestedQuestions && message.metadata.suggestedQuestions.length > 0 && (
          <div className="space-y-1 max-w-[80%]">
            <p className="text-xs text-muted-foreground">You might also ask:</p>
            <div className="space-y-1">
              {message.metadata.suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="w-full text-left bg-secondary/50 hover:bg-secondary rounded px-2 py-1.5 text-xs transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
