'use client'

import { motion } from 'framer-motion'
import { Upload, FileText, Link as LinkIcon, Youtube, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SourceList } from '@/components/sources/SourceList'

export function LeftPanel() {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-80 border-r bg-card flex flex-col overflow-hidden"
    >
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Sources
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Upload section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Add Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Upload PDF
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <LinkIcon className="h-4 w-4" />
              Add URL
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <Youtube className="h-4 w-4" />
              YouTube Link
            </Button>
          </CardContent>
        </Card>

        {/* Source list */}
        <SourceList />

        {/* Profile summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <CardTitle className="text-sm">Your Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <div className="text-muted-foreground">Role</div>
              <div className="font-medium">Software Engineer</div>
            </div>
            <div>
              <div className="text-muted-foreground">Level</div>
              <div className="font-medium">Intermediate</div>
            </div>
            <div>
              <div className="text-muted-foreground">Current Topic</div>
              <div className="font-medium">Machine Learning</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.aside>
  )
}
