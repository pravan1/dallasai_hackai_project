'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Clock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

// Mock recommendations for MVP
const mockRecommendations = [
  {
    id: '1',
    title: 'Practice gradient descent',
    description: 'Test your understanding with 5 questions on optimization',
    reasoning: 'You\'ve read about gradient descent but haven\'t practiced it yet',
    estimatedTimeMinutes: 15,
    difficultyLevel: 'medium' as const,
    priorityScore: 0.9,
  },
  {
    id: '2',
    title: 'Review backpropagation',
    description: 'Strengthen your understanding of neural network training',
    reasoning: 'This builds on gradient descent and is essential for deep learning',
    estimatedTimeMinutes: 20,
    difficultyLevel: 'hard' as const,
    priorityScore: 0.75,
  },
  {
    id: '3',
    title: 'Watch: Activation Functions Explained',
    description: 'Short video covering ReLU, sigmoid, and tanh',
    reasoning: 'Visual explanation will complement your reading',
    estimatedTimeMinutes: 8,
    difficultyLevel: 'easy' as const,
    priorityScore: 0.6,
  },
]

export function RecommendationsPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Next Steps</h3>
        <Button size="sm" variant="outline" className="gap-2">
          <Sparkles className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {mockRecommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {rec.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {rec.estimatedTimeMinutes}m
                    </div>
                    <div className="flex gap-1">
                      {'⭐'.repeat(Math.ceil(rec.priorityScore * 3))}
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded p-2 text-xs">
                  <span className="text-muted-foreground">Why: </span>
                  <span>{rec.reasoning}</span>
                </div>

                <Button size="sm" className="w-full gap-2">
                  Start
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {mockRecommendations.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No recommendations yet. Start a conversation or upload sources to get personalized suggestions.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
