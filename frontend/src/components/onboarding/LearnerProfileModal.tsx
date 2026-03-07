'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Target, BookOpen, Clock, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface LearnerProfile {
  name: string
  role: string
  topic: string
  level: 'beginner' | 'intermediate' | 'advanced'
  background: string
  goals: string
  weeklyHours: number
}

const defaultProfile: LearnerProfile = {
  name: '',
  role: '',
  topic: '',
  level: 'intermediate',
  background: '',
  goals: '',
  weeklyHours: 5,
}

const STORAGE_KEY = 'learnflow_profile'

export function useLearnerProfile() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setProfile(JSON.parse(stored))
    } catch {}
  }, [])

  const saveProfile = (p: LearnerProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
    } catch {}
    setProfile(p)
  }

  return { profile, saveProfile }
}

interface LearnerProfileModalProps {
  isOpen: boolean
  onClose: () => void
  initialProfile?: LearnerProfile | null
  onSave: (profile: LearnerProfile) => void
}

const levelOptions = [
  { value: 'beginner', label: 'Beginner', desc: 'New to this topic' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some foundation' },
  { value: 'advanced', label: 'Advanced', desc: 'Deep expertise' },
]

export function LearnerProfileModal({
  isOpen,
  onClose,
  initialProfile,
  onSave,
}: LearnerProfileModalProps) {
  const [form, setForm] = useState<LearnerProfile>(initialProfile ?? defaultProfile)

  useEffect(() => {
    if (initialProfile) setForm(initialProfile)
    else setForm(defaultProfile)
  }, [initialProfile, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div>
                  <h2 className="font-semibold text-sm">Set Up Your Learning Profile</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Help us personalize your recommendations
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3 w-3" /> Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full px-3 py-2 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3" /> Role
                    </label>
                    <input
                      type="text"
                      value={form.role}
                      onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                      placeholder="e.g. Software Engineer"
                      className="w-full px-3 py-2 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Target className="h-3 w-3" /> What are you learning?
                  </label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    placeholder="e.g. Machine Learning, React, Product Management"
                    className="w-full px-3 py-2 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Current Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {levelOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setForm(f => ({ ...f, level: opt.value as LearnerProfile['level'] }))
                        }
                        className={`p-3 rounded-lg border text-left transition-all ${
                          form.level === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        <div className="text-xs font-medium">{opt.label}</div>
                        <div className="text-xs opacity-60 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Your Background</label>
                  <textarea
                    value={form.background}
                    onChange={e => setForm(f => ({ ...f, background: e.target.value }))}
                    placeholder="What do you already know? Any specific gaps or blockers?"
                    rows={3}
                    className="w-full px-3 py-2 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Target className="h-3 w-3" /> Learning Goals
                  </label>
                  <textarea
                    value={form.goals}
                    onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
                    placeholder="What do you want to achieve? e.g. Build a neural network from scratch, pass a certification..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Weekly hours available:
                    <span className="text-foreground font-semibold ml-1">{form.weeklyHours}h</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={40}
                    value={form.weeklyHours}
                    onChange={e => setForm(f => ({ ...f, weeklyHours: Number(e.target.value) }))}
                    className="w-full accent-primary h-1.5"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground/60">
                    <span>1h</span>
                    <span>10h</span>
                    <span>20h</span>
                    <span>40h</span>
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" size="sm">
                  Save Profile & Start Learning
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
