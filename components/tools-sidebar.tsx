'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ITEMS, CATEGORY_ORDER, searchItems, groupByCategory, type Item } from '@/lib/tools.items'

function cn(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(' ')
}

type NavItem = Pick<Item,'href'|'label'|'icon'>

export function ToolsSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (!/INPUT|TEXTAREA|SELECT/.test(tag ?? '') && e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const filtered = React.useMemo(() => searchItems(query), [query])
  const grouped = React.useMemo(() => groupByCategory(filtered), [filtered])

  const Section = ({ title, items }: { title: string; items: NavItem[] }) => (
    <>
      <div className="px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {title} <span className="ml-1 text-foreground/50">({items.length})</span>
      </div>
      <ul className="mt-1 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-md border',
                    active ? 'border-border bg-card' : 'border-transparent bg-muted group-hover:bg-card group-hover:border-border'
                  )}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
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
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="pl-8 h-9 mt-2"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground mt-1" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-2 py-1 space-y-4">
          {CATEGORY_ORDER.map(cat => {
            const list = grouped.get(cat)
            if (!list?.length) return null
            // Map ke NavItem minimal
            const items = list.map(it => ({ href: it.href, label: it.label, icon: it.icon }))
            return <Section key={cat} title={cat} items={items} />
          })}
          {!CATEGORY_ORDER.some(c => grouped.get(c)?.length) && (
            <div className="text-sm text-muted-foreground px-2">No results</div>
          )}
        </nav>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <div className="text-xs text-muted-foreground">
          Tip: tekan <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">/</kbd> untuk fokus pencarian
        </div>
      </div>
    </>
  )

  return (
    <>
      <aside className="hidden md:block">
        <div className="sticky top-4 h-[calc(100vh-rem)] w-64 shrink-0 rounded-2xl border border-border bg-card text-card-foreground shadow-md flex flex-col">
          <div className="h-12 flex items-center px-3 border-b border-border">
            <div className="text-sm font-semibold">Tools Navigation</div>
          </div>
          {NavList}
        </div>
      </aside>

      <div className="md:hidden mb-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="h-12 flex items-center justify-between border border-border rounded-2xl bg-card text-card-foreground px-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open tools menu" asChild>
              <SheetTrigger>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
            </Button>
            <div className="text-sm font-semibold">Tools</div>
            <div className="w-9" />
          </div>
          <SheetContent side="left" className="p-0 w-[86vw] max-w=[360px]">
            <div className="h-12 flex items-center px-3 border-b border-border bg-card">
              <div className="text-sm font-semibold">Tools</div>
            </div>
            {NavList}
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
