'use client'

import { useEffect, useState } from 'react'
import { FileText, Link as LinkIcon, Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Source } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export function SourceList() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchSources()
  }, [])

  async function fetchSources() {
    try {
      const res = await fetch(`${API_URL}/api/sources`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setSources(data.sources ?? [])
    } catch {
      // Backend not running yet — show empty state silently
      setSources([])
    } finally {
      setLoading(false)
    }
  }

  async function deleteSource(id: string) {
    setDeletingId(id)
    try {
      await fetch(`${API_URL}/api/sources/${id}`, { method: 'DELETE' })
      setSources((prev) => prev.filter((s) => s.id !== id))
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground px-1 py-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading sources…
      </div>
    )
  }

  if (sources.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No sources yet. Upload a PDF, add a URL, or paste text above.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wide px-1">
        Your Sources ({sources.length})
      </p>
      <div className="space-y-1">
        {sources.map((source) => (
          <Card key={source.id} className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-3 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {source.type === 'pdf' && <FileText className="h-4 w-4 text-blue-600" />}
                {(source.type === 'url' || source.type === 'youtube') && (
                  <LinkIcon className="h-4 w-4 text-green-600" />
                )}
                {source.type === 'note' && <FileText className="h-4 w-4 text-orange-500" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{source.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {source.status === 'processing' && (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Processing…</span>
                    </>
                  )}
                  {source.status === 'ready' && (
                    <span className="text-xs text-green-600">Ready</span>
                  )}
                  {source.status === 'failed' && (
                    <span className="text-xs text-destructive">Failed</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => deleteSource(source.id)}
                disabled={deletingId === source.id}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Remove source"
              >
                {deletingId === source.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
