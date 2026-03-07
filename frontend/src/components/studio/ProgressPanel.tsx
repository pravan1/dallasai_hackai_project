'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  TrendingUp,
  Clock,
  MessageSquare,
  Target,
  Zap,
  Brain,
  AlertTriangle,
  BarChart3,
} from 'lucide-react'

const stats = [
  { label: 'Study Time', value: '45 min', icon: Clock, change: '+15%', pos: true },
  { label: 'Messages', value: '12', icon: MessageSquare, change: '+3 today', pos: true },
  { label: 'Accuracy', value: '75%', icon: Target, change: '8 questions', pos: true },
  { label: 'Streak', value: '3 days', icon: TrendingUp, change: 'Keep going!', pos: true },
]

const implicitSignals = [
  {
    label: 'Hesitation on Backpropagation',
    detail: 'Paused 4× before answering — may need a different explanation style',
    type: 'warning',
    icon: AlertTriangle,
  },
  {
    label: 'Revisited Gradient Descent 3×',
    detail: 'High interest signal — consider deeper practice or alternative formats',
    type: 'info',
    icon: Brain,
  },
  {
    label: 'Strong on Loss Functions',
    detail: 'Fast answers, high confidence — ready for next-level material',
    type: 'success',
    icon: Zap,
  },
  {
    label: 'Voice queries increasing',
    detail: '67% of inputs via voice this week — you learn better by talking it out',
    type: 'info',
    icon: MessageSquare,
  },
]

const signalStyles = {
  warning: 'text-yellow-400 bg-yellow-400/8 border-yellow-400/20',
  info: 'text-primary bg-primary/8 border-primary/20',
  success: 'text-green-400 bg-green-400/8 border-green-400/20',
}

const weeklyData = [40, 65, 30, 80, 55, 70, 45]
const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function ProgressPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm">Your Progress</h3>
        <p className="text-xs text-muted-foreground mt-0.5">This week's learning data</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <stat.icon className="h-3.5 w-3.5" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-green-400">{stat.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly activity chart */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            Weekly Activity
          </div>
          <div className="flex items-end justify-between gap-1.5 h-20">
            {weeklyData.map((height, index) => (
              <div key={index} className="flex-1 flex flex-col justify-end items-center gap-1">
                <div
                  className="w-full rounded-t transition-all duration-500"
                  style={{
                    height: `${height}%`,
                    backgroundColor:
                      height === Math.max(...weeklyData)
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--primary) / 0.3)',
                  }}
                />
                <span className="text-xs text-muted-foreground">{weekDays[index]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implicit signals */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Implicit Learning Signals
            </div>
            <p className="text-xs text-muted-foreground">
              Detected from your behavior — not just what you say
            </p>
          </div>
          <div className="space-y-2">
            {implicitSignals.map((signal, i) => {
              const Icon = signal.icon
              const style = signalStyles[signal.type as keyof typeof signalStyles]
              return (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs ${style}`}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">{signal.label}</div>
                    <div className="opacity-65 mt-0.5 leading-relaxed">{signal.detail}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
