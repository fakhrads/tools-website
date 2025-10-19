'use client'

import * as React from 'react'
import { ToolsSidebar } from '@/components/tools-sidebar'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
        {/* ⬇️ Mobile: 1 kolom (stack), Desktop: 2 kolom [sidebar, content] */}
        <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] md:gap-6">
          <ToolsSidebar />
          <main className="min-w-0 w-full">
            <div className="py-0">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
