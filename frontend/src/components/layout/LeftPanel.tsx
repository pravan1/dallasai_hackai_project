'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Link as LinkIcon,
  Youtube,
  User,
  Clock,
  TrendingUp,
  Edit2,
  ChevronRight,
  Zap,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export function LeftPanel() {
  const [showModal, setShowModal] = useState(false)
  const { profile, saveProfile } = useLearnerProfile()

  return (
    <>
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-80 border-r border-border bg-card flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
            Sources
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Upload section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Add Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Upload PDF
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <LinkIcon className="h-4 w-4" />
                Add URL
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Youtube className="h-4 w-4" />
                YouTube Link
              </Button>
            </CardContent>
          </Card>

          {/* Source list */}
          <SourceList />

          {/* Profile section */}
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
                {profile.name && (
                  <div className="font-medium">{profile.name}</div>
                )}
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
                {learningSignals.map(signal => (
                  <div key={signal.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{signal.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{signal.value}</span>
                      {signal.trend && (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
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
