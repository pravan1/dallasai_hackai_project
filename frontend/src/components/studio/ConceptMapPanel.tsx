'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Network, Info } from 'lucide-react'

interface ConceptNode {
  id: string
  label: string
  x: number
  y: number
  mastery: number
  isKey: boolean
}

interface ConceptEdge {
  from: string
  to: string
  type: 'prerequisite' | 'related' | 'advanced'
}

const nodes: ConceptNode[] = [
  { id: 'nn', label: 'Neural Networks', x: 220, y: 100, mastery: 70, isKey: true },
  { id: 'gd', label: 'Gradient Descent', x: 360, y: 200, mastery: 85, isKey: true },
  { id: 'bp', label: 'Backpropagation', x: 80, y: 210, mastery: 45, isKey: true },
  { id: 'lf', label: 'Loss Functions', x: 300, y: 310, mastery: 60, isKey: false },
  { id: 'af', label: 'Activation Fns', x: 110, y: 330, mastery: 30, isKey: false },
  { id: 'cnn', label: 'CNNs', x: 380, y: 80, mastery: 20, isKey: false },
  { id: 'opt', label: 'Optimizers', x: 440, y: 280, mastery: 40, isKey: false },
]

const edges: ConceptEdge[] = [
  { from: 'nn', to: 'gd', type: 'prerequisite' },
  { from: 'nn', to: 'bp', type: 'prerequisite' },
  { from: 'gd', to: 'lf', type: 'related' },
  { from: 'bp', to: 'af', type: 'related' },
  { from: 'bp', to: 'lf', type: 'related' },
  { from: 'nn', to: 'cnn', type: 'advanced' },
  { from: 'gd', to: 'opt', type: 'advanced' },
]

function masteryColor(mastery: number): string {
  if (mastery >= 75) return '#89b4fa'
  if (mastery >= 50) return '#5b8fd4'
  if (mastery >= 30) return '#3a6299'
  return '#24405e'
}

function edgeStroke(type: ConceptEdge['type']): { color: string; dash?: string; width: number } {
  if (type === 'prerequisite') return { color: '#89b4fa', width: 1.5 }
  if (type === 'related') return { color: '#4a6fa5', dash: '4 3', width: 1 }
  return { color: '#2d4163', dash: '2 4', width: 1 }
}

export function ConceptMapPanel() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph')

  const getNode = (id: string) => nodes.find(n => n.id === id)!

  const focusNodes = nodes.filter(n => n.mastery < 50)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Concept Map</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Your learning landscape</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-2.5 py-1 transition-colors ${
                viewMode === 'graph'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Graph
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              List
            </button>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs">
            <Network className="h-3 w-3" />
            Generate
          </Button>
        </div>
      </div>

      {viewMode === 'graph' ? (
        <Card>
          <CardContent className="p-3">
            <div className="relative">
              <svg viewBox="0 0 500 400" style={{ width: '100%', height: '240px' }}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Edges */}
                {edges.map((edge, i) => {
                  const from = getNode(edge.from)
                  const to = getNode(edge.to)
                  const style = edgeStroke(edge.type)
                  return (
                    <line
                      key={i}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={style.color}
                      strokeWidth={style.width}
                      strokeOpacity={0.45}
                      strokeDasharray={style.dash}
                    />
                  )
                })}

                {/* Nodes */}
                {nodes.map(node => {
                  const isHovered = hoveredNode === node.id
                  const radius = node.isKey ? 24 : 18
                  const color = masteryColor(node.mastery)

                  return (
                    <g
                      key={node.id}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {isHovered && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={radius + 7}
                          fill="none"
                          stroke="#89b4fa"
                          strokeWidth={1}
                          strokeOpacity={0.4}
                          filter="url(#glow)"
                        />
                      )}
                      {/* Outer ring */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius}
                        fill={color}
                        fillOpacity={0.12}
                        stroke={color}
                        strokeWidth={isHovered ? 2 : 1.5}
                        strokeOpacity={isHovered ? 1 : 0.7}
                      />
                      {/* Inner mastery fill */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius * (node.mastery / 100) * 0.75}
                        fill={color}
                        fillOpacity={0.35}
                      />
                      {/* Label above node */}
                      <text
                        x={node.x}
                        y={node.y - radius - 5}
                        textAnchor="middle"
                        fontSize={8.5}
                        fill="#7e9ec0"
                        style={{ userSelect: 'none' }}
                      >
                        {node.label}
                      </text>
                      {/* Mastery % inside node */}
                      <text
                        x={node.x}
                        y={node.y + 4}
                        textAnchor="middle"
                        fontSize={node.isKey ? 10 : 8}
                        fontWeight="600"
                        fill={color}
                        style={{ userSelect: 'none' }}
                      >
                        {node.mastery}%
                      </text>
                    </g>
                  )
                })}
              </svg>

              {/* Hover tooltip */}
              {hoveredNode && (() => {
                const node = getNode(hoveredNode)
                return (
                  <div className="absolute top-2 right-2 bg-card border border-border rounded-lg p-2.5 text-xs shadow-lg min-w-[130px] space-y-1">
                    <div className="font-medium">{node.label}</div>
                    <div className="text-muted-foreground">
                      Mastery:{' '}
                      <span
                        className="font-semibold"
                        style={{ color: masteryColor(node.mastery) }}
                      >
                        {node.mastery}%
                      </span>
                    </div>
                    {node.mastery < 50 && (
                      <div className="text-yellow-400 text-xs">⚠ Needs attention</div>
                    )}
                    {node.isKey && <div className="text-primary text-xs">★ Key concept</div>}
                  </div>
                )
              })()}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-px bg-primary/60" />
                <span>Prerequisite</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-px border-t border-dashed border-primary/30" />
                <span>Advanced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
                <span>High mastery</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">Sorted by mastery</p>
            <div className="space-y-2.5">
              {[...nodes]
                .sort((a, b) => b.mastery - a.mastery)
                .map(node => (
                  <div key={node.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>{node.label}</span>
                        {node.isKey && (
                          <span className="text-primary text-xs">★</span>
                        )}
                      </div>
                      <span
                        className="font-semibold"
                        style={{ color: masteryColor(node.mastery) }}
                      >
                        {node.mastery}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${node.mastery}%`,
                          backgroundColor: masteryColor(node.mastery),
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Focus areas */}
      {focusNodes.length > 0 && (
        <Card>
          <CardContent className="p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Info className="h-3.5 w-3.5 text-primary" />
              Focus areas
            </div>
            <div className="space-y-1.5">
              {focusNodes.map(n => (
                <div key={n.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{n.label}</span>
                  <span className="text-yellow-400">{n.mastery}% — needs work</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
