'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Clock, MessageSquare, Target } from 'lucide-react'

export function ProgressPanel() {
  const stats = [
    { label: 'Study Time Today', value: '45 min', icon: Clock, change: '+15%' },
    { label: 'Messages Sent', value: '12', icon: MessageSquare, change: '+3' },
    { label: 'Questions Answered', value: '8', icon: Target, change: '75% correct' },
    { label: 'Streak', value: '3 days', icon: TrendingUp, change: 'Keep going!' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Your Progress</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <stat.icon className="h-4 w-4" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-green-600">{stat.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground font-medium">Weekly Activity</p>
          <div className="flex items-end justify-between gap-1 h-24">
            {[40, 65, 30, 80, 55, 70, 45].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col justify-end items-center gap-1">
                <div
                  className="w-full bg-primary rounded-t"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
