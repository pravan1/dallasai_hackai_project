'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Lightbulb,
  BookOpen,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Question {
  id: string
  type: 'multiple_choice' | 'scenario'
  scenario?: string
  question: string
  options: string[]
  correct: number
  explanation: string
  concept: string
}

const mockQuestions: Question[] = [
  {
    id: '1',
    type: 'scenario',
    scenario:
      "You're training a neural network and notice the training loss keeps decreasing, but the validation loss starts increasing after epoch 10.",
    question: 'What is the most likely problem and what should you do?',
    options: [
      'The model is underfitting — add more layers',
      'The model is overfitting — try dropout or early stopping',
      'The learning rate is too high — reduce it significantly',
      'The data is normalized incorrectly — check preprocessing',
    ],
    correct: 1,
    explanation:
      'Diverging training vs. validation loss is a classic sign of overfitting. The model is memorizing the training data instead of generalizing. Dropout, L2 regularization, or early stopping are the right interventions.',
    concept: 'Overfitting',
  },
  {
    id: '2',
    type: 'multiple_choice',
    question: 'In gradient descent, what does the learning rate control?',
    options: [
      'The number of training epochs',
      'How much we adjust weights based on the gradient',
      'The size of training mini-batches',
      'The depth of the neural network',
    ],
    correct: 1,
    explanation:
      'The learning rate (α) scales the gradient update: w = w − α·∇L. Too high and you overshoot minima; too low and training is slow or gets stuck in local minima.',
    concept: 'Gradient Descent',
  },
  {
    id: '3',
    type: 'scenario',
    scenario:
      "Your model's gradients are vanishing — weights in early layers barely update during backpropagation.",
    question: 'Which activation function would best help with this problem?',
    options: [
      'Sigmoid — it has smooth bounded output',
      'Tanh — it centers output around zero',
      'ReLU — it passes gradients through cleanly for positive inputs',
      'Softmax — it normalizes outputs to probabilities',
    ],
    correct: 2,
    explanation:
      'ReLU has a gradient of exactly 1 for positive inputs, which prevents gradient shrinkage during backpropagation. This is why it replaced sigmoid/tanh in deep networks — it solves the vanishing gradient problem in practice.',
    concept: 'Activation Functions',
  },
]

export function PracticePanel() {
  const [mode, setMode] = useState<'overview' | 'quiz'>('overview')
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [completed, setCompleted] = useState(false)

  const question = mockQuestions[currentQ]

  const handleSelect = (idx: number) => {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    setScore(s => ({
      correct: s.correct + (idx === question.correct ? 1 : 0),
      total: s.total + 1,
    }))
  }

  const handleNext = () => {
    if (currentQ < mockQuestions.length - 1) {
      setCurrentQ(q => q + 1)
      setSelected(null)
      setAnswered(false)
    } else {
      setCompleted(true)
    }
  }

  const handleReset = () => {
    setMode('overview')
    setCurrentQ(0)
    setSelected(null)
    setAnswered(false)
    setScore({ correct: 0, total: 0 })
    setCompleted(false)
  }

  if (mode === 'overview') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Practice & Quiz</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Scenario-based challenges</p>
          </div>
          <Button size="sm" className="gap-1.5 h-7 text-xs" onClick={() => setMode('quiz')}>
            <Brain className="h-3 w-3" />
            Start Practice
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Today's Progress</span>
                <span className="font-medium">3/5 questions</span>
              </div>
              <Progress value={60} className="h-1.5" />
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground font-medium">Recent Performance</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    <span>Gradient Descent</span>
                  </div>
                  <span className="text-muted-foreground">3/3</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-yellow-400" />
                    <span>Loss Functions</span>
                  </div>
                  <span className="text-muted-foreground">2/3</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              Practice Set
            </div>
            <div className="space-y-2">
              {mockQuestions.map((q, i) => (
                <div
                  key={q.id}
                  className="flex items-center gap-2 text-xs p-2.5 rounded-lg bg-muted/40 border border-border/50"
                >
                  <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{q.concept}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {q.type === 'scenario' ? '📋 Scenario-based' : '❓ Multiple choice'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              className="w-full gap-2 h-8 text-xs"
              onClick={() => setMode('quiz')}
            >
              Start {mockQuestions.length}-Question Practice
              <ChevronRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (completed) {
    const pct = Math.round((score.correct / score.total) * 100)
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div
              className={`text-5xl font-bold ${
                pct >= 70 ? 'text-primary' : 'text-yellow-400'
              }`}
            >
              {pct}%
            </div>
            <div>
              <p className="text-sm font-medium">{score.correct}/{score.total} correct</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                {pct >= 80
                  ? "Excellent work — you're ready to move on to the next concept."
                  : pct >= 60
                  ? 'Good progress. Review the explanations and try again to reinforce.'
                  : 'Keep practicing — revisit the concepts in the Recommendations tab first.'}
              </p>
            </div>
            <Button size="sm" className="w-full gap-2" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Back to Overview
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Progress header */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Question {currentQ + 1} of {mockQuestions.length}
        </span>
        <span className="text-primary font-medium">{score.correct} correct</span>
      </div>
      <Progress value={(currentQ / mockQuestions.length) * 100} className="h-1" />

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.18 }}
        >
          <Card>
            <CardContent className="p-4 space-y-3">
              {/* Badges */}
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {question.concept}
                </span>
                {question.type === 'scenario' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    Scenario
                  </span>
                )}
              </div>

              {/* Scenario block */}
              {question.scenario && (
                <div className="bg-muted/50 rounded-lg p-3 text-xs leading-relaxed text-muted-foreground border-l-2 border-primary/40">
                  {question.scenario}
                </div>
              )}

              {/* Question text */}
              <p className="text-sm font-medium leading-relaxed">{question.question}</p>

              {/* Options */}
              <div className="space-y-2">
                {question.options.map((opt, i) => {
                  let cls =
                    'w-full text-left p-2.5 rounded-lg border text-xs transition-all '
                  if (!answered) {
                    cls += 'border-border hover:border-primary/40 hover:bg-muted/40'
                  } else if (i === question.correct) {
                    cls += 'border-green-500/40 bg-green-500/10 text-green-400'
                  } else if (i === selected && i !== question.correct) {
                    cls += 'border-red-500/40 bg-red-500/10 text-red-400'
                  } else {
                    cls += 'border-border opacity-40'
                  }
                  return (
                    <button key={i} className={cls} onClick={() => handleSelect(i)}>
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-4 h-4 rounded-full border border-current flex items-center justify-center mt-0.5 text-xs font-medium">
                          {answered && i === question.correct
                            ? '✓'
                            : answered && i === selected
                            ? '✗'
                            : String.fromCharCode(65 + i)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-muted/40 rounded-lg p-3 space-y-1.5"
                >
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
                    Explanation
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {question.explanation}
                  </p>
                </motion.div>
              )}

              {answered && (
                <Button size="sm" className="w-full gap-2 h-8 text-xs" onClick={handleNext}>
                  {currentQ < mockQuestions.length - 1 ? 'Next Question' : 'See Results'}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <Button
        size="sm"
        variant="outline"
        className="w-full h-7 text-xs gap-2"
        onClick={handleReset}
      >
        <RotateCcw className="h-3 w-3" />
        Back to Overview
      </Button>
    </div>
  )
}
