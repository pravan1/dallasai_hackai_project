'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mic, Hand, Brain, BookOpen, Sparkles, ArrowRight, TrendingUp } from 'lucide-react'
import { Map } from 'lucide-react'
import PillNav from '@/components/nav/PillNav'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Learn', href: '/learn' },
]

const LOGO_NODE = (
  <div className="flex items-center justify-center w-full h-full">
    <Sparkles style={{ width: 18, height: 18, color: '#80b8f5' }} />
  </div>
)

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Floating pill nav */}
      <div className="sticky top-0 z-50 pt-3 pb-2 pointer-events-none">
        <div className="pointer-events-auto">
          <PillNav
            logoNode={LOGO_NODE}
            logoAlt="LearnFlow"
            items={NAV_ITEMS}
            baseColor="#0d0d0d"
            pillColor="#1a1a1a"
            hoveredPillTextColor="#80b8f5"
            pillTextColor="#707070"
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <Sparkles className="h-3 w-3" />
            AI-Powered Professional Learning
          </div>
          <h1 className="text-5xl font-bold mb-6 tracking-tight">
            Learn smarter.<br />
            <span className="text-primary">Progress faster.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Tell us where you are, and we&apos;ll map where you should go next.
            Personalized recommendations, practice scenarios, and visual learning paths — powered by AI.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start Learning
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-sm text-muted-foreground">No setup required</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2 text-sm">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center"
        >
          <h2 className="text-2xl font-bold mb-3">Ready to accelerate your learning?</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Enter your background, get a personalized learning path, and start making progress today.
          </p>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Launch LearnFlow
            <Sparkles className="h-4 w-4" />
          </Link>
        </motion.div>
      </main>
    </div>
  )
}

const features = [
  {
    title: 'Personalized Recommendations',
    description: 'AI analyzes your learning history and implicit signals to suggest exactly what to study next — with clear reasoning.',
    icon: <Brain className="h-5 w-5 text-primary" />,
  },
  {
    title: 'Visual Concept Map',
    description: 'See your entire learning landscape mapped visually. Track mastery across concepts and discover gaps.',
    icon: <Map className="h-5 w-5 text-primary" />,
  },
  {
    title: 'Practice Scenarios',
    description: 'Hands-on practice with real-world scenarios, adaptive quizzes, and instant feedback.',
    icon: <BookOpen className="h-5 w-5 text-primary" />,
  },
  {
    title: 'Voice Interaction',
    description: 'Ask questions and get explanations naturally. Voice input and text-to-speech responses.',
    icon: <Mic className="h-5 w-5 text-primary" />,
  },
  {
    title: 'Progress Tracking',
    description: 'Track your learning velocity, detect hesitation patterns, and see your improvement over time.',
    icon: <TrendingUp className="h-5 w-5 text-primary" />,
  },
  {
    title: 'Gesture Control',
    description: 'Navigate hands-free with MediaPipe hand gestures. Swipe through cards and questions.',
    icon: <Hand className="h-5 w-5 text-primary" />,
  },
]
