'use client'

import { useState } from 'react'
import { CenterPanel } from '@/components/layout/CenterPanel'
import { LeftPanel } from '@/components/layout/LeftPanel'
import { RightPanel } from '@/components/layout/RightPanel'

export default function LearnPage() {
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)

  return (
    <>
      <LeftPanel isOpen={leftOpen} onToggle={() => setLeftOpen((v) => !v)} />
      <CenterPanel />
      <RightPanel isOpen={rightOpen} onToggle={() => setRightOpen((v) => !v)} />
    </>
  )
}
