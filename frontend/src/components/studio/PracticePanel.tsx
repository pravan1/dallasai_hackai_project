'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Brain, CheckCircle2 } from 'lucide-react'

export function PracticePanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Practice & Quiz</h3>
        <Button size="sm" className="gap-2">
          <Brain className="h-3 w-3" />
          Generate Quiz
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today's Progress</span>
              <span className="font-medium">3/5 questions</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>

          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground">Recent Performance</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Gradient Descent (3/3)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Loss Functions (2/3)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Click "Generate Quiz" to create practice questions based on your sources and learning goals.
        </CardContent>
      </Card>
    </div>
  )
}
