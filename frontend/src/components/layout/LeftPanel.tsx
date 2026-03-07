'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Link as LinkIcon, Loader2, Plus, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SourceList } from '@/components/sources/SourceList'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

type AddMode = null | 'url' | 'youtube' | 'note'

export function LeftPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [addMode, setAddMode] = useState<AddMode>(null)
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Incrementing this key forces SourceList to re-fetch after every successful add
  const [refreshKey, setRefreshKey] = useState(0)

  function refresh() {
    setRefreshKey((k) => k + 1)
    setAddMode(null)
    setInputValue('')
  }

  // ----------------------------------------------------------------- PDF upload

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_URL}/api/sources/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(await res.text())
      refresh()
    } catch (err) {
      console.error('PDF upload failed:', err)
      alert('Upload failed. Make sure the backend is running on port 8000.')
    } finally {
      setIsSubmitting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ------------------------------------------------------ URL / YouTube / Note

  async function handleAddSource() {
    if (!inputValue.trim() || !addMode) return

    setIsSubmitting(true)
    try {
      const body =
        addMode === 'note'
          ? { type: 'note', content: inputValue, title: inputValue.slice(0, 60) }
          : { type: addMode, url: inputValue, title: inputValue }

      const res = await fetch(`${API_URL}/api/sources/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await res.text())
      refresh()
    } catch (err) {
      console.error('Add source failed:', err)
      alert('Failed to add source. Make sure the backend is running on port 8000.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const placeholders: Record<NonNullable<AddMode>, string> = {
    url: 'https://example.com/article',
    youtube: 'https://youtube.com/watch?v=...',
    note: 'Paste or type your notes here…',
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-80 border-r bg-card flex flex-col overflow-hidden"
    >
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Sources
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Add Source card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Add Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Hidden file input — triggered by "Upload PDF" button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              disabled={isSubmitting}
              onClick={() => {
                setAddMode(null)
                fileInputRef.current?.click()
              }}
            >
              {isSubmitting && addMode === null ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Upload PDF
            </Button>

            <Button
              variant={addMode === 'url' ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => setAddMode(addMode === 'url' ? null : 'url')}
            >
              <LinkIcon className="h-4 w-4" />
              Add URL
            </Button>

            <Button
              variant={addMode === 'youtube' ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => setAddMode(addMode === 'youtube' ? null : 'youtube')}
            >
              YouTube Link
            </Button>

            <Button
              variant={addMode === 'note' ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => setAddMode(addMode === 'note' ? null : 'note')}
            >
              <Plus className="h-4 w-4" />
              Paste Text / Note
            </Button>

            {/* Inline expandable form */}
            <AnimatePresence>
              {addMode && (
                <motion.div
                  key={addMode}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 space-y-2">
                    {addMode === 'note' ? (
                      <textarea
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        rows={4}
                        placeholder={placeholders[addMode]}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                    ) : (
                      <Input
                        placeholder={placeholders[addMode]}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSource()}
                      />
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={!inputValue.trim() || isSubmitting}
                        onClick={handleAddSource}
                      >
                        {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAddMode(null)
                          setInputValue('')
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Live source list — key change triggers re-fetch */}
        <SourceList key={refreshKey} />

        {/* Profile summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <CardTitle className="text-sm">Your Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <div className="text-muted-foreground">Role</div>
              <div className="font-medium">Software Engineer</div>
            </div>
            <div>
              <div className="text-muted-foreground">Level</div>
              <div className="font-medium">Intermediate</div>
            </div>
            <div>
              <div className="text-muted-foreground">Current Topic</div>
              <div className="font-medium">Machine Learning</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.aside>
  )
}
