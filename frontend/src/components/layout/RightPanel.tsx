'use client'

import { motion } from 'framer-motion'
import { Sparkles, ClipboardCheck, Network, BarChart3 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RecommendationsPanel } from '@/components/studio/RecommendationsPanel'
import { PracticePanel } from '@/components/studio/PracticePanel'
import { ConceptMapPanel } from '@/components/studio/ConceptMapPanel'
import { ProgressPanel } from '@/components/studio/ProgressPanel'

export function RightPanel() {
  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="w-96 border-l bg-card flex flex-col overflow-hidden"
    >
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Studio
        </h2>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="recommendations" className="h-full flex flex-col">
          <TabsList className="m-4 grid grid-cols-4">
            <TabsTrigger value="recommendations" className="text-xs">
              <Sparkles className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="practice" className="text-xs">
              <ClipboardCheck className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="map" className="text-xs">
              <Network className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xs">
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
    </motion.aside>
  )
}
