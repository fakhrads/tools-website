'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Hammer } from 'lucide-react'

// util cn (fallback) — ganti dengan util milikmu bila sudah ada
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

const NAV_ITEMS = [
  { key: 'studio', label: 'Studio' },
  { key: 'converters', label: 'Converters' },
  { key: 'inspectors', label: 'Inspectors' },
  { key: 'about', label: 'About' },
] as const

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const params = useSearchParams()
  const current = (params.get('tab') as (typeof NAV_ITEMS)[number]['key']) || 'studio'

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between py-4 gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <Hammer className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">DevTools Studio</h1>
                <p className="text-xs text-slate-500">Toolkit ringan untuk development — semua berjalan di browser.</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Input placeholder="Cari tool… (coming soon)" className="w-56" />
              <Button variant="secondary" size="sm">Feedback</Button>
            </div>
          </div>
        </div>

        {/* Navbar (shadcn/ui NavigationMenu) */}
        <nav className="border-t">
          <div className="mx-auto max-w-6xl px-4">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-1">
                {NAV_ITEMS.map((it) => {
                  const href = `/tools?tab=${it.key}`
                  const active = current === it.key
                  return (
                    <NavigationMenuItem key={it.key}>
                      <Link href={href} legacyBehavior passHref>
                        <NavigationMenuLink
                          className={cn(
                            'px-3 py-2 rounded-xl text-sm transition-colors',
                            active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                          )}
                          aria-current={active ? 'page' : undefined}
                        >
                          {it.label}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </nav>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
          Made with ❤️ · Next.js App Router · Tailwind + shadcn/ui
        </div>
      </footer>
    </div>
  )
}
