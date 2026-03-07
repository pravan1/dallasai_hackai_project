'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FileText,
  Link as LinkIcon,
  Loader2,
  Plus,
  User,
  X,
  Youtube,
  Clock,
  TrendingUp,
  Edit2,
  ChevronRight,
  Zap,
  ChevronLeft,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SourceList } from '@/components/sources/SourceList'
import {
  LearnerProfileModal,
  useLearnerProfile,
} from '@/components/onboarding/LearnerProfileModal'

const levelColors = {
  beginner: 'text-yellow-400',
  intermediate: 'text-primary',
  advanced: 'text-green-400',
}

const levelLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

const learningSignals = [
  { label: 'Topics revisited', value: '4', trend: true },
  { label: 'Avg session', value: '28 min', trend: false },
  { label: 'Voice queries', value: '67%', trend: true },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

type AddMode = null | 'url' | 'youtube' | 'note'

interface LeftPanelProps {
  isOpen: boolean
  onToggle: () => void
}

export function LeftPanel({ isOpen, onToggle }: LeftPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [addMode, setAddMode] = useState<AddMode>(null)
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const [showModal, setShowModal] = useState(false)
  const { profile, saveProfile } = useLearnerProfile()

  function refresh() {
    setRefreshKey((k) => k + 1)
    setAddMode(null)
    setInputValue('')
  }

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
    <>
      <motion.aside
        animate={{ width: isOpen ? 320 : 40 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="relative border-r border-border bg-card flex flex-col overflow-hidden flex-shrink-0"
        style={{ minWidth: isOpen ? 320 : 40 }}
      >
        {/* Collapsed tab */}
        {!isOpen && (
          <button
            onClick={onToggle}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 hover:bg-muted/40 transition-colors group"
            title="Open Sources"
          >
            <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Sources
            </span>
          </button>
        )}

        {/* Expanded content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col h-full"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Sources
                </h2>
                <button
                  onClick={onToggle}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted/50"
                  title="Collapse"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add Source card — wired to backend API */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Add Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
                <Youtube className="h-4 w-4" />
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
                          {isSubmitting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Add'
                          )}
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

          <SourceList key={refreshKey} />

          {/* Learner Profile */}
          {profile ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">Your Profile</CardTitle>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                    title="Edit profile"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {profile.name && <div className="font-medium">{profile.name}</div>}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Role</div>
                    <div className="text-xs font-medium truncate">{profile.role || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Level</div>
                    <div className={`text-xs font-semibold ${levelColors[profile.level]}`}>
                      {levelLabels[profile.level]}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Learning</div>
                  <div className="text-xs font-medium text-primary">{profile.topic || '—'}</div>
                </div>
                {profile.goals && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Goal</div>
                    <div className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {profile.goals}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-1.5 pt-1 border-t border-border text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {profile.weeklyHours}h / week available
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-primary/30">
              <CardContent className="p-5 text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Set up your profile</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tell us your background to get personalized recommendations
                  </p>
                </div>
                <Button size="sm" className="w-full gap-2" onClick={() => setShowModal(true)}>
                  Get Started
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Learning signals */}
          {profile && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Learning Signals</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {learningSignals.map((signal) => (
                  <div key={signal.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{signal.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{signal.value}</span>
                      {signal.trend && <TrendingUp className="h-3 w-3 text-green-400" />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      <LearnerProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialProfile={profile}
        onSave={saveProfile}
      />
    </>
  )
}
