'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Network, Loader2, Upload, RefreshCw } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Concept {
  id: string
  label: string
  description: string
  importance: 'high' | 'medium' | 'low'
}

interface Relationship {
  from: string
  to: string
  type: 'prerequisite' | 'related' | 'part_of'
}

const importanceColor: Record<string, string> = {
  high: '#89b4fa',
  medium: '#5b8fd4',
  low: '#3a6299',
}

export function ConceptMapPanel() {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(true)
  const [noSources, setNoSources] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  async function fetchConceptMap() {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/concept-map`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setConcepts(data.concepts ?? [])
      setRelationships(data.relationships ?? [])
      setNoSources(data.noSources ?? false)
    } catch {
      setConcepts([])
      setRelationships([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConceptMap() }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Extracting concepts from your sources…
      </div>
    )
  }

  if (noSources || concepts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Concept Map</h3>
          <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={fetchConceptMap}>
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">No sources yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a PDF, add a URL, or paste text — key concepts will be extracted and mapped automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const COLS = 3
  const nodePositions = concepts.map((_, i) => ({
    x: 80 + (i % COLS) * 160,
    y: 60 + Math.floor(i / COLS) * 120,
  }))
  const getPos = (id: string) => {
    const idx = concepts.findIndex(c => c.id === id)
    return idx >= 0 ? nodePositions[idx] : null
  }
  const svgHeight = Math.max(200, Math.ceil(concepts.length / COLS) * 120 + 60)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Concept Map</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Extracted from your sources</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={fetchConceptMap}>
          <Network className="h-3 w-3" />
          Regenerate
        </Button>
      </div>

      <Card>
        <CardContent className="p-3">
          <svg viewBox={`0 0 520 ${svgHeight}`} style={{ width: '100%', height: `${svgHeight}px` }}>
            {relationships.map((rel, i) => {
              const from = getPos(rel.from)
              const to = getPos(rel.to)
              if (!from || !to) return null
              return (
                <line key={i}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={rel.type === 'prerequisite' ? '#89b4fa' : '#4a6fa5'}
                  strokeWidth={1.5} strokeOpacity={0.4}
                  strokeDasharray={rel.type === 'related' ? '4 3' : undefined}
                />
              )
            })}

            {concepts.map((concept, i) => {
              const pos = nodePositions[i]
              const color = importanceColor[concept.importance] ?? importanceColor.medium
              const isHov = hovered === concept.id
              return (
                <g key={concept.id}
                  onMouseEnter={() => setHovered(concept.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={pos.x} cy={pos.y} r={22}
                    fill={color} fillOpacity={isHov ? 0.2 : 0.1}
                    stroke={color} strokeWidth={isHov ? 2 : 1.5} strokeOpacity={isHov ? 1 : 0.7}
                  />
                  <text x={pos.x} y={pos.y - 28} textAnchor="middle" fontSize={8} fill="#7e9ec0"
                    style={{ userSelect: 'none' }}>
                    {concept.label.length > 14 ? concept.label.slice(0, 13) + '\u2026' : concept.label}
                  </text>
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={9} fontWeight="600" fill={color}
                    style={{ userSelect: 'none' }}>
                    {concept.importance === 'high' ? '\u2605' : '\u25cf'}
                  </text>
                </g>
              )
            })}
          </svg>

          {hovered && (() => {
            const c = concepts.find(x => x.id === hovered)
            if (!c) return null
            return (
              <div className="mt-2 p-2.5 bg-muted/40 rounded-lg border border-border text-xs space-y-1">
                <div className="font-medium">{c.label}</div>
                <div className="text-muted-foreground leading-relaxed">{c.description}</div>
                <div className="text-primary capitalize">{c.importance} importance</div>
              </div>
            )
          })()}

          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px bg-primary/60" /><span>Prerequisite</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px border-t border-dashed border-primary/30" /><span>Related</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">All concepts ({concepts.length})</p>
          {concepts.map(c => (
            <div key={c.id} className="flex items-start gap-2 text-xs">
              <span style={{ color: importanceColor[c.importance] }} className="mt-0.5 flex-shrink-0">
                {c.importance === 'high' ? '\u2605' : '\u25cf'}
              </span>
              <div>
                <span className="font-medium">{c.label}</span>
                <span className="text-muted-foreground ml-2">{c.description}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
