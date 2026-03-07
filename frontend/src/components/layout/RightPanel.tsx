'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, ClipboardCheck, Network, BarChart3, ChevronRight, Layers } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RecommendationsPanel } from '@/components/studio/RecommendationsPanel'
import { PracticePanel } from '@/components/studio/PracticePanel'
import { ConceptMapPanel } from '@/components/studio/ConceptMapPanel'
import { ProgressPanel } from '@/components/studio/ProgressPanel'

interface RightPanelProps {
  isOpen: boolean
  onToggle: () => void
}

export function RightPanel({ isOpen, onToggle }: RightPanelProps) {
  return (
    <motion.aside
      animate={{ width: isOpen ? 384 : 40 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative border-l border-border bg-card flex flex-col overflow-hidden flex-shrink-0"
      style={{ minWidth: isOpen ? 384 : 40 }}
    >
      {/* Collapsed tab */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 hover:bg-muted/40 transition-colors group"
          title="Open Studio"
        >
          <Layers className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span
            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors"
            style={{ writingMode: 'vertical-rl' }}
          >
            Studio
          </span>
        </button>
      )}

      {/* Expanded content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col h-full"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <button
                onClick={onToggle}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted/50"
                title="Collapse"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Studio
              </h2>
            </div>

            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="recommendations" className="h-full flex flex-col">
                <TabsList className="m-4 grid grid-cols-4">
                  <TabsTrigger value="recommendations" className="text-xs" title="Recommendations">
                    <Sparkles className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="practice" className="text-xs" title="Practice">
                    <ClipboardCheck className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="map" className="text-xs" title="Concept Map">
                    <Network className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="progress" className="text-xs" title="Progress">
                    <BarChart3 className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  <TabsContent value="recommendations">
                    <RecommendationsPanel />
                  </TabsContent>
                  <TabsContent value="practice">
                    <PracticePanel />
                  </TabsContent>
                  <TabsContent value="map">
                    <ConceptMapPanel />
                  </TabsContent>
                  <TabsContent value="progress">
                    <ProgressPanel />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
