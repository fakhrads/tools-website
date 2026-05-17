'use client'

import * as React from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, ArrowRight } from 'lucide-react'
import { ITEMS, CATEGORY_ORDER, searchItems, groupByCategory, type Item } from '@/lib/tools.items'

const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ')

const CATEGORY_META: Record<string, { color: string; bg: string; ring: string }> = {
  Development: { color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', ring: 'ring-indigo-200 dark:ring-indigo-500/20' },
  Data:        { color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', ring: 'ring-emerald-200 dark:ring-emerald-500/20' },
  Utilities:   { color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', ring: 'ring-amber-200 dark:ring-amber-500/20' },
  Network:     { color: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10', ring: 'ring-sky-200 dark:ring-sky-500/20' },
  Security:    { color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', ring: 'ring-rose-200 dark:ring-rose-500/20' },
}

const TOOL_COUNT = ITEMS.filter(i => i.category !== 'Main').length

export default function ToolsOverview() {
  const [q, setQ] = React.useState('')
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

  const searched = React.useMemo(
    () => searchItems(q).filter(i => i.category !== 'Main'),
    [q]
  )
  const grouped = React.useMemo(() => groupByCategory(searched), [searched])
  const hasResults = CATEGORY_ORDER.some(c => c !== 'Main' && (grouped.get(c) ?? []).length > 0)

  return (
    <div className="grid gap-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">All Tools</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {TOOL_COUNT} tools · runs entirely in your browser
          </p>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="pl-9 pr-12 rounded-xl bg-muted/60 border-border/60 focus-visible:ring-primary/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground select-none">
            /
          </kbd>
        </div>
      </div>

      {/* ── Category sections ── */}
      {hasResults ? (
        <div className="grid gap-10">
          {CATEGORY_ORDER.filter(c => c !== 'Main').map(cat => {
            const list = grouped.get(cat as Item['category']) ?? []
            if (!list.length) return null
            const meta = CATEGORY_META[cat] ?? CATEGORY_META.Development
            return (
              <section key={cat}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={cx('inline-flex items-center justify-center h-6 w-6 rounded-md ring-1', meta.bg, meta.ring)}>
                    <span className={cx('h-2 w-2 rounded-full', meta.color.replace('text-', 'bg-'))} />
                  </span>
                  <h2 className="text-sm font-semibold text-foreground">{cat}</h2>
                  <span className="text-xs text-muted-foreground">{list.length} tool{list.length !== 1 ? 's' : ''}</span>
                  <div className="flex-1 h-px bg-border/60" />
                </div>

                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map(tool => (
                    <ToolCard key={tool.href} tool={tool} meta={meta} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No tools found</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different keyword</p>
        </div>
      )}
    </div>
  )
}

function ToolCard({
  tool,
  meta,
}: {
  tool: Item
  meta: { color: string; bg: string; ring: string }
}) {
  return (
    <Link
      href={tool.href}
      className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-150"
    >
      {/* Icon + category */}
      <div className="flex items-center justify-between">
        <span className={cx(
          'inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-colors',
          meta.bg, meta.ring, meta.color,
          'group-hover:ring-primary/30 group-hover:bg-accent group-hover:text-primary'
        )}>
          {tool.icon}
        </span>
        <Badge
          variant="secondary"
          className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-muted/80 text-muted-foreground border-0"
        >
          {tool.category}
        </Badge>
      </div>

      {/* Label */}
      <div className="flex-1">
        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {tool.label}
        </div>

        {tool.keywords?.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {tool.keywords.slice(0, 3).map(k => (
              <span
                key={k}
                className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground"
              >
                {k}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors mt-auto pt-1 border-t border-border/40">
        Open tool
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  )
}
