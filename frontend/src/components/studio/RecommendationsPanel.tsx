'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sparkles,
  Clock,
  ArrowRight,
  Brain,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  Upload,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Recommendation {
  type: string
  title: string
  description: string
  reasoning: string
  difficultyLevel: 'easy' | 'medium' | 'hard'
  estimatedTimeMinutes: number
  priorityScore: number
}

const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  medium: { label: 'Medium', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  hard: { label: 'Hard', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

export function RecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [noSources, setNoSources] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(0)

  async function fetchRecommendations() {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/recommendations?userId=anonymous`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setRecommendations(data.recommendations ?? [])
      setNoSources(data.noSources ?? false)
    } catch {
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Generating recommendations…
      </div>
    )
  }

  if (noSources || recommendations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Next Steps</h3>
          <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={fetchRecommendations}>
            <Sparkles className="h-3 w-3" />
            Refresh
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">No sources yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a PDF, add a URL, or paste text in the Sources panel — recommendations will be generated from your material.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Next Steps</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Based on your uploaded sources</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={fetchRecommendations}>
          <Sparkles className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      <div className="space-y-2.5">
        {recommendations.map((rec, index) => {
          const isExpanded = expanded === index
          const diffConfig = difficultyConfig[rec.difficultyLevel] ?? difficultyConfig.medium
          const TypeIcon = rec.type === 'practice' ? Brain : BookOpen

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.07 }}
            >
              <Card className={`transition-all overflow-hidden ${isExpanded ? 'border-primary/30' : 'hover:border-primary/20'}`}>
                <CardContent className="p-0">
                  <button
                    className="w-full text-left p-3.5 flex items-start gap-3"
                    onClick={() => setExpanded(isExpanded ? null : index)}
                  >
                    <TypeIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block mb-1">{rec.title}</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${diffConfig.className}`}>
                          {diffConfig.label}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rec.estimatedTimeMinutes}m
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-muted-foreground mt-1">
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3.5 pb-3.5 space-y-3 border-t border-border/50 pt-3">
                          <p className="text-xs leading-relaxed text-muted-foreground bg-muted/40 rounded-lg p-2.5">
                            {rec.reasoning}
                          </p>
                          <Button size="sm" className="w-full gap-2 h-8 text-xs">
                            Start Now
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
