'use client'

import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, BarChart3, BookOpen } from 'lucide-react'

export function ProgressPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm">Your Progress</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Tracked as you learn</p>
      </div>

      <Card>
        <CardContent className="p-6 text-center space-y-3">
          <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Progress tracking coming soon</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Start a conversation in the chat panel. As you ask questions and practice, your learning signals will appear here.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            How to get started
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-primary mt-0.5">1.</span>
              <span>Upload a PDF, URL, or paste text in the Sources panel on the left</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary mt-0.5">2.</span>
              <span>Ask questions about your material in the chat</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary mt-0.5">3.</span>
              <span>Try the Practice tab for questions generated from your sources</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary mt-0.5">4.</span>
              <span>Check the Concept Map tab to see topics extracted from your material</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            Session
          </div>
          <p className="text-xs text-muted-foreground">No activity yet this session.</p>
        </CardContent>
      </Card>
    </div>
  )
}
