'use client'

import { FileText, Link as LinkIcon, Youtube, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

// Mock data for MVP
const mockSources = [
  {
    id: '1',
    type: 'pdf' as const,
    title: 'Machine Learning Basics.pdf',
    status: 'ready' as const,
  },
  {
    id: '2',
    type: 'url' as const,
    title: 'Neural Networks Guide',
    status: 'ready' as const,
  },
  {
    id: '3',
    type: 'youtube' as const,
    title: 'Deep Learning Fundamentals',
    status: 'processing' as const,
  },
]

export function SourceList() {
  if (mockSources.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No sources yet. Upload a PDF, add a URL, or link a YouTube video to get started.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wide px-1">
        Your Sources ({mockSources.length})
      </p>
      <div className="space-y-1">
        {mockSources.map((source) => (
          <Card
            key={source.id}
            className="hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <CardContent className="p-3 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {source.type === 'pdf' && <FileText className="h-4 w-4 text-blue-600" />}
                {source.type === 'url' && <LinkIcon className="h-4 w-4 text-green-600" />}
                {source.type === 'youtube' && <Youtube className="h-4 w-4 text-red-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{source.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {source.status === 'processing' && (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Processing...</span>
                    </>
                  )}
                  {source.status === 'ready' && (
                    <span className="text-xs text-green-600">Ready</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
