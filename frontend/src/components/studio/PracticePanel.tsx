'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Brain, ChevronRight, RotateCcw, Lightbulb, Loader2, Upload, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Question {
  id: string
  type: string
  concept: string
  question: string
  options: string[]
  correct: number
  explanation: string
}

export function PracticePanel() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [noSources, setNoSources] = useState(false)
  const [mode, setMode] = useState<'overview' | 'quiz'>('overview')
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [completed, setCompleted] = useState(false)

  async function fetchQuestions() {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/practice-questions`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setQuestions(data.questions ?? [])
      setNoSources(data.noSources ?? false)
    } catch {
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const question = questions[currentQ]

  const handleSelect = (idx: number) => {
    if (answered || !question) return
    setSelected(idx)
    setAnswered(true)
    setScore(s => ({
      correct: s.correct + (idx === question.correct ? 1 : 0),
      total: s.total + 1,
    }))
  }

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Generating questions from your sources…
      </div>
    )
  }

  if (noSources || questions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Practice & Quiz</h3>
          <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={fetchQuestions}>
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">No sources yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a PDF, add a URL, or paste text — practice questions will be generated from your material.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mode === 'overview') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Practice & Quiz</h3>
            <p className="text-xs text-muted-foreground mt-0.5">From your uploaded sources</p>
          </div>
          <Button size="sm" className="gap-1.5 h-7 text-xs" onClick={() => setMode('quiz')}>
            <Brain className="h-3 w-3" />
            Start Practice
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground font-medium">{questions.length} questions generated</p>
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className="flex items-center gap-2 text-xs p-2.5 rounded-lg bg-muted/40 border border-border/50"
                >
                  <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{q.concept}</div>
                    <div className="text-muted-foreground text-xs mt-0.5 truncate">{q.question}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button size="sm" className="w-full gap-2 h-8 text-xs" onClick={() => setMode('quiz')}>
              Start {questions.length}-Question Practice
              <ChevronRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-2" onClick={fetchQuestions}>
          <RefreshCw className="h-3 w-3" />
          Regenerate Questions
        </Button>
      </div>
    )
  }

  if (completed) {
    const pct = Math.round((score.correct / score.total) * 100)
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className={`text-5xl font-bold ${pct >= 70 ? 'text-primary' : 'text-yellow-400'}`}>
              {pct}%
            </div>
            <div>
              <p className="text-sm font-medium">{score.correct}/{score.total} correct</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                {pct >= 80
                  ? 'Excellent — you have a strong grasp of the material.'
                  : pct >= 60
                  ? 'Good progress. Review the explanations and try again.'
                  : 'Keep at it — re-read your sources and try again.'}
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
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Question {currentQ + 1} of {questions.length}</span>
        <span className="text-primary font-medium">{score.correct} correct</span>
      </div>
      <Progress value={(currentQ / questions.length) * 100} className="h-1" />

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
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {question.concept}
              </span>

              <p className="text-sm font-medium leading-relaxed">{question.question}</p>

              <div className="space-y-2">
                {question.options.map((opt, i) => {
                  let cls = 'w-full text-left p-2.5 rounded-lg border text-xs transition-all '
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
                          {answered && i === question.correct ? '✓' : answered && i === selected ? '✗' : String.fromCharCode(65 + i)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

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
                  <p className="text-xs text-muted-foreground leading-relaxed">{question.explanation}</p>
                </motion.div>
              )}

              {answered && (
                <Button size="sm" className="w-full gap-2 h-8 text-xs" onClick={handleNext}>
                  {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-2" onClick={handleReset}>
        <RotateCcw className="h-3 w-3" />
        Back to Overview
      </Button>
    </div>
  )
}
