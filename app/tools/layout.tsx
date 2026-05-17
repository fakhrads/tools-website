'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { ITEMS } from '@/lib/tools.items'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isOverview = pathname === '/tools'

  const tool = React.useMemo(
    () => ITEMS.find(i => i.href === pathname),
    [pathname]
  )

  return (
    <div className="grid gap-6">
      {!isOverview && (
        <div className="flex items-center gap-3">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Tools
          </Link>

          {tool && (
            <>
              <span className="text-border">/</span>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground">
                  {tool.icon}
                </span>
                {tool.label}
              </span>
            </>
          )}
        </div>
      )}

      {children}
    </div>
  )
}
