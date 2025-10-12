'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Wand2, Shuffle, Search, Code2, Info, FileJson } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

function cn(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(' ')
}

type Item = {
  href: string
  label: string
  icon: React.ReactNode
  badge?: string
}

const PRIMARY: Item[] = [
  { href: '/tools', label: 'All Tools', icon: <Wand2 className="h-4 w-4" /> },
  { href: '/tools/prettier', label: 'Prettier', icon: <Wand2 className="h-4 w-4" /> },
  { href: '/tools/converters', label: 'Converters', icon: <Shuffle className="h-4 w-4" /> },
  { href: '/tools/inspectors', label: 'Inspectors', icon: <Code2 className="h-4 w-4" />, badge: 'Soon' },
  { href: '/tools/about', label: 'About', icon: <Info className="h-4 w-4" /> },
]

const QUICK: Item[] = [
  { href: '/tools/json-lint', label: 'JSON Lint', icon: <FileJson className="h-4 w-4" /> },
  { href: '/tools/prettier', label: 'Prettier Formatter', icon: <Wand2 className="h-4 w-4" /> },
]

/** Sidebar utama /tools berbasis route (tanpa query) */
export function ToolsSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  const Section = ({ title, items }: { title: string; items: Item[] }) => (
    <>
      <div className="px-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        {title}
      </div>
      <ul className="mt-1 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-md border',
                    active
                      ? 'border-slate-300 bg-white'
                      : 'border-transparent bg-slate-100 group-hover:bg-white group-hover:border-slate-200'
                  )}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant={active ? 'secondary' : 'outline'} className="h-5 text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )

  const NavList = (
    <>
      <div className="px-3 pb-2">
        <div className="relative">
          <Input placeholder="Search tools…" className="pl-8 h-9" />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-2 py-1 space-y-4">
          <Section title="Tools" items={PRIMARY} />
          <Section title="Quick" items={QUICK} />
        </nav>
      </ScrollArea>

      <div className="border-t p-3">
        <div className="text-xs text-slate-500">
          Tip: tekan <kbd className="rounded border px-1 py-0.5 text-[10px]">/</kbd> untuk fokus pencarian
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex md:flex-col md:border-right md:border-r md:bg-white md:w-64 md:shrink-0">
        <div className="h-12 flex items-center px-3 border-b">
          <div className="text-sm font-semibold text-slate-800">Tools</div>
        </div>
        {NavList}
      </aside>

      {/* Mobile */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="h-12 flex items-center justify-between border-b bg-white px-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open tools menu" asChild>
              <SheetTrigger>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
            </Button>
            <div className="text-sm font-semibold">Tools</div>
            <div className="w-9" />
          </div>
          <SheetContent side="left" className="p-0 w-[86vw] max-w-[360px]">
            <div className="h-12 flex items-center px-3 border-b">
              <div className="text-sm font-semibold text-slate-800">Tools</div>
            </div>
            {NavList}
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
