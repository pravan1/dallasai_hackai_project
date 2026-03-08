'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Target, Clock, ChevronRight, User, Briefcase, BookOpen } from 'lucide-react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { type LearnerProfile } from '@/components/onboarding/LearnerProfileModal'

const STORAGE_KEY = 'learnflow_profile'

const defaultProfile: LearnerProfile = {
  name: '',
  role: '',
  topic: '',
  level: 'intermediate',
  background: '',
  goals: '',
  weeklyHours: 5,
  studyStyle: [],
}

const levelOptions = [
  { value: 'beginner', label: 'Beginner', desc: 'New to this topic' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some foundation' },
  { value: 'advanced', label: 'Advanced', desc: 'Deep expertise' },
]

const studyStyleOptions = [
  { value: 'quizzes', label: 'Quizzes & Repetition', icon: '🧠' },
  { value: 'videos', label: 'Videos', icon: '🎥' },
  { value: 'slideshows', label: 'Slideshows & Slides', icon: '📊' },
  { value: 'reading', label: 'Reading & Articles', icon: '📖' },
  { value: 'hands-on', label: 'Hands-on Projects', icon: '🛠️' },
  { value: 'discussion', label: 'Discussion & Teaching', icon: '💬' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [form, setForm] = useState<LearnerProfile>(defaultProfile)

  // Pre-fill name from Auth0 session
  useEffect(() => {
    if (user) {
      const firstName = user.given_name ?? user.nickname ?? user.name?.split(' ')[0] ?? ''
      setForm(f => ({ ...f, name: f.name || firstName }))
    }
  }, [user])

  const toggleStudyStyle = (value: string) => {
    setForm(f => ({
      ...f,
      studyStyle: f.studyStyle.includes(value)
        ? f.studyStyle.filter(s => s !== value)
        : [...f.studyStyle, value],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch {}
    router.push('/learn')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold tracking-wide text-primary">jarvis.ai</span>
      </div>

      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          {user && (
            <p className="text-primary text-sm font-medium mb-1">
              Hey {user.given_name ?? user.nickname ?? user.name?.split(' ')[0] ?? 'there'} 👋
            </p>
          )}
          <h1 className="text-2xl font-bold mb-2">Set up your learning profile</h1>
          <p className="text-sm text-muted-foreground">
            Help us personalize your recommendations and learning path.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name + Role row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Your Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Your Role
              </label>
              <input
                type="text"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                placeholder="e.g. Software Engineer"
                className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              What are you learning?
            </label>
            <input
              type="text"
              value={form.topic}
              onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              placeholder="e.g. software engineering, Machine Learning, React..."
              required
              className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Level</label>
            <div className="grid grid-cols-3 gap-3">
              {levelOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm(f => ({ ...f, level: opt.value as LearnerProfile['level'] }))
                  }
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.level === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <div className="text-sm font-semibold">{opt.label}</div>
                  <div className="text-xs opacity-60 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Study Style */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              How do you learn best?
              <span className="text-xs text-muted-foreground font-normal">(pick all that apply)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {studyStyleOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleStudyStyle(opt.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                    form.studyStyle.includes(opt.value)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span className="font-medium text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Background</label>
            <textarea
              value={form.background}
              onChange={e => setForm(f => ({ ...f, background: e.target.value }))}
              placeholder="What do you already know? Any specific gaps or blockers?"
              rows={3}
              className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40 resize-none"
            />
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Learning Goals
            </label>
            <textarea
              value={form.goals}
              onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
              placeholder="What do you want to achieve? e.g. Build a neural network from scratch, pass a certification..."
              rows={3}
              className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40 resize-none"
            />
          </div>

          {/* Weekly hours */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Weekly hours available:{' '}
              <span className="text-foreground font-bold">{form.weeklyHours}h</span>
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

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Save Profile & Start Learning
            <ChevronRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
