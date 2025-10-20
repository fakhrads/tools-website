'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Wand2, Search, FileJson, House, Code, DockIcon, Code2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

function cn(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(' ')
}

type Item = { href: string; label: string; icon: React.ReactNode; badge?: string }

const MAIN: Item[] = [{ href: '/tools', label: 'All Tools', icon: <House className="h-4 w-4" /> }]
const PRIMARY: Item[] = [
  { href: '/tools/prettier', label: 'Code Prettier', icon: <Wand2 className="h-4 w-4" /> },
  { href: '/tools/json-lint', label: 'JSON Linter', icon: <FileJson className="h-4 w-4" /> },
  { href: '/tools/regex-tester', label: 'Regex Tester', icon: <Code className="h-4 w-4" /> },
  { href: '/tools/word-counter', label: 'Word Counter', icon: <DockIcon className="h-4 w-4" /> },
  { href: '/tools/csv-to-json', label: 'CSV to JSON', icon: <Code2Icon className="h-4 w-4" /> },
]

export function ToolsSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  const Section = ({ title, items }: { title: string; items: Item[] }) => (
    <>
      <div className="px-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">{title}</div>
      <ul className="mt-1 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
          <Input placeholder="Search tools…" className="pl-8 h-9 mt-2" />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 mt-1" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-2 py-1 space-y-4">
          <Section title="Main" items={MAIN} />
          <Section title="Tools" items={PRIMARY} />
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
      {/* Desktop sidebar (sticky kiri) */}
      <aside className="hidden md:block">
        <div className="sticky top-4 h-[calc(100vh-6rem)] w-64 shrink-0 rounded-2xl border bg-white shadow-md flex flex-col">
          <div className="h-12 flex items-center px-3 border-b">
            <div className="text-sm font-semibold text-slate-800">Tools</div>
          </div>
          {NavList}
        </div>
      </aside>

      {/* Mobile header + sheet (di atas konten, full width) */}
      <div className="md:hidden mb-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="h-12 flex items-center justify-between border rounded-2xl bg-white px-3">
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
