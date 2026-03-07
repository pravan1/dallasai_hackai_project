'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Network } from 'lucide-react'

export function ConceptMapPanel() {
  const concepts = [
    { id: '1', name: 'Neural Networks', mastery: 70 },
    { id: '2', name: 'Gradient Descent', mastery: 85 },
    { id: '3', name: 'Backpropagation', mastery: 45 },
    { id: '4', name: 'Loss Functions', mastery: 60 },
    { id: '5', name: 'Activation Functions', mastery: 30 },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Learning Map</h3>
        <Button size="sm" variant="outline" className="gap-2">
          <Network className="h-3 w-3" />
          Generate
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">Key Concepts</p>
          <div className="space-y-2">
            {concepts.map((concept) => (
              <div key={concept.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{concept.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {concept.mastery}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${concept.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Visual graph view coming soon. For now, see your concept mastery above.
        </CardContent>
      </Card>
    </div>
  )
}
