'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sparkles,
  Clock,
  ArrowRight,
  Youtube,
  Brain,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Zap,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type RecommendationType = 'practice' | 'topic' | 'video'
type Difficulty = 'easy' | 'medium' | 'hard'

interface Resource {
  type: 'youtube' | 'article'
  title: string
  url: string
  startAt?: string
  endAt?: string
  note: string
}

interface Recommendation {
  id: string
  title: string
  description: string
  type: RecommendationType
  reasoning: string
  signals: string[]
  estimatedTimeMinutes: number
  difficulty: Difficulty
  priorityScore: number
  tags: string[]
  resource?: Resource
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Practice gradient descent',
    description: 'Hands-on problems to cement your understanding of optimization',
    type: 'practice',
    reasoning:
      "You've read about gradient descent 3 times but haven't practiced it yet. Your hesitation rate was high on related questions — practice will close this gap.",
    signals: ['Revisited 3×', 'Hesitation detected', '18 min avg read time'],
    estimatedTimeMinutes: 15,
    difficulty: 'medium',
    priorityScore: 0.9,
    tags: ['Optimization', 'Core Concept'],
    resource: {
      type: 'youtube',
      title: '3Blue1Brown: Gradient descent, how neural networks learn',
      url: 'https://www.youtube.com/watch?v=IHZwWFHWa-w',
      startAt: '4:32',
      endAt: '9:15',
      note: 'The visual animation in this segment explains the intuition far better than text.',
    },
  },
  {
    id: '2',
    title: 'Deep dive: Backpropagation',
    description: 'Understand how neural networks actually train end-to-end',
    type: 'topic',
    reasoning:
      'You have strong gradient descent mastery (85%) — backpropagation is the logical next step. Two of your uploaded sources reference it but you haven\'t engaged with it yet.',
    signals: ['GD mastery: 85%', 'Mentioned in 2 sources', 'Not yet studied'],
    estimatedTimeMinutes: 20,
    difficulty: 'hard',
    priorityScore: 0.78,
    tags: ['Neural Networks', 'Fundamentals'],
    resource: {
      type: 'youtube',
      title: "Andrej Karpathy: The spelled-out intro to backprop",
      url: 'https://www.youtube.com/watch?v=VMj-3S1tku0',
      startAt: '0:00',
      endAt: '7:30',
      note: 'Start from the very beginning — Karpathy builds intuition before the math.',
    },
  },
  {
    id: '3',
    title: 'Activation Functions: Quick Visual Fix',
    description: 'Fill the gap with a focused visual explainer on ReLU, sigmoid, tanh',
    type: 'video',
    reasoning:
      'Activation functions are at 30% mastery — your weakest area. A targeted 8-minute resource will give you the intuition you need before it blocks progress elsewhere.',
    signals: ['Mastery: 30%', 'Blocked 1 question', 'Fast gap to fill'],
    estimatedTimeMinutes: 8,
    difficulty: 'easy',
    priorityScore: 0.62,
    tags: ['Activation', 'Quick Win'],
    resource: {
      type: 'article',
      title: 'Visualizing Activation Functions in Neural Networks — colah\'s blog',
      url: 'https://colah.github.io/posts/2014-03-NN-Manifolds-Topology/',
      note: 'Interactive visualizations — builds intuition fast. No heavy math required.',
    },
  },
]

const difficultyConfig: Record<Difficulty, { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  medium: { label: 'Medium', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  hard: { label: 'Hard', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

const typeConfig: Record<
  RecommendationType,
  { icon: React.ElementType; color: string }
> = {
  practice: { icon: Brain, color: 'text-primary' },
  topic: { icon: BookOpen, color: 'text-accent' },
  video: { icon: Youtube, color: 'text-red-400' },
}

export function RecommendationsPanel() {
  const [expanded, setExpanded] = useState<string | null>('1')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Next Steps</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Based on your learning history</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs">
          <Sparkles className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      <div className="space-y-2.5">
        {mockRecommendations.map((rec, index) => {
          const TypeIcon = typeConfig[rec.type].icon
          const typeColor = typeConfig[rec.type].color
          const diffConfig = difficultyConfig[rec.difficulty]
          const isExpanded = expanded === rec.id

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.07 }}
            >
              <Card
                className={`transition-all overflow-hidden ${isExpanded ? 'border-primary/30' : 'hover:border-primary/20'}`}
              >
                <CardContent className="p-0">
                  {/* Header row */}
                  <button
                    className="w-full text-left p-3.5 flex items-start gap-3"
                    onClick={() => setExpanded(isExpanded ? null : rec.id)}
                  >
                    <div className={`mt-0.5 flex-shrink-0 ${typeColor}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block mb-1">{rec.title}</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded border ${diffConfig.className}`}
                        >
                          {diffConfig.label}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rec.estimatedTimeMinutes}m
                        </span>
                        {rec.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-muted-foreground mt-1">
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
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
                          {/* Reasoning */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <AlertCircle className="h-3 w-3" />
                              Why this?
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground bg-muted/40 rounded-lg p-2.5">
                              {rec.reasoning}
                            </p>
                            <div className="flex gap-1.5 flex-wrap">
                              {rec.signals.map(signal => (
                                <span
                                  key={signal}
                                  className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1"
                                >
                                  <TrendingUp className="h-2.5 w-2.5" />
                                  {signal}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Resource */}
                          {rec.resource && (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                {rec.resource.type === 'youtube' ? (
                                  <Youtube className="h-3 w-3 text-red-400" />
                                ) : (
                                  <ExternalLink className="h-3 w-3" />
                                )}
                                Recommended resource
                              </div>
                              <div className="bg-muted/40 rounded-lg p-2.5 space-y-1.5">
                                <div className="text-xs font-medium">{rec.resource.title}</div>
                                {rec.resource.type === 'youtube' && rec.resource.startAt && (
                                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                                    <Zap className="h-3 w-3" />
                                    Watch: {rec.resource.startAt} → {rec.resource.endAt}
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground italic">
                                  {rec.resource.note}
                                </p>
                              </div>
                            </div>
                          )}

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
