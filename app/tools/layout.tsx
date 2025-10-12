'use client'

import * as React from 'react'
import { ToolsSidebar } from '@/components/tools-sidebar'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex">
          <ToolsSidebar />
          <main className="flex-1 min-w-0">
            <div className="px-4 md:px-6 py-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
