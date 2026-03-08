'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import PillNav from '@/components/nav/PillNav'
import { MacbookScroll } from '@/components/ui/macbook-scroll'

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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Floating pill nav */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-3 pb-2 flex justify-center pointer-events-none">
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

      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8">
          <Sparkles className="h-3 w-3" />
          AI-Powered Professional Learning
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 max-w-2xl leading-tight">
          Learn smarter.<br />
          <span className="text-primary">Progress faster.</span>
        </h1>

        <p className="text-base text-muted-foreground max-w-xl mb-10 leading-relaxed">
          Tell us where you are — we&apos;ll map where you should go next.
          Personalized paths, practice scenarios, and visual concept maps powered by AI.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-sm text-muted-foreground/60">No setup required</span>
        </div>
      </section>

      {/* MacBook scroll reveal */}
      <section className="bg-background">
        <MacbookScroll
          title={
            <span className="text-foreground">
              Your AI learning workspace,<br />
              <span className="text-primary">built for professionals.</span>
            </span>
          }
          src="/app-preview.png"
          showGradient={false}
        />
      </section>

      {/* Footer CTA */}
      <section className="flex flex-col items-center justify-center py-28 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to accelerate?</h2>
        <p className="text-muted-foreground text-sm mb-8 max-w-md">
          Enter your background, get a personalized learning path, and start making real progress today.
        </p>
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Launch LearnFlow
          <Sparkles className="h-4 w-4" />
        </Link>
      </section>
    </div>
  )
}
