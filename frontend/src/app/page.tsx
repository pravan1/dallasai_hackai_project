'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mic, Hand, Brain, BookOpen, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LearnFlow
              </span>
            </div>
            <Link
              href="/learn"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Transform Your Learning Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            AI-powered professional learning with voice interaction, gesture controls,
            and personalized recommendations.
          </p>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-blue-600 text-white text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start Learning
            <BookOpen className="h-5 w-5" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to accelerate your learning?</h2>
          <p className="text-blue-100 mb-6">
            Upload your sources, start a conversation, and let AI guide your journey.
          </p>
          <Link
            href="/learn"
            className="inline-block px-8 py-3 rounded-lg bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors"
          >
            Launch LearnFlow
          </Link>
        </motion.div>
      </main>
    </div>
  )
}

const features = [
  {
    title: 'Voice Interaction',
    description: 'Speak naturally with AI. Ask questions and get instant voice responses.',
    icon: <Mic className="h-6 w-6 text-blue-600" />,
  },
  {
    title: 'Gesture Control',
    description: 'Navigate hands-free with simple hand gestures. Swipe to move between questions.',
    icon: <Hand className="h-6 w-6 text-blue-600" />,
  },
  {
    title: 'Smart Recommendations',
    description: 'Get personalized learning paths based on your progress and goals.',
    icon: <Brain className="h-6 w-6 text-blue-600" />,
  },
  {
    title: 'Practice & Quizzes',
    description: 'Test your knowledge with AI-generated questions grounded in your sources.',
    icon: <BookOpen className="h-6 w-6 text-blue-600" />,
  },
]
