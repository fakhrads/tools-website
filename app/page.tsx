'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Search, ExternalLink } from 'lucide-react'
import { ITEMS, CATEGORY_ORDER, searchItems, groupByCategory, type Item } from '@/lib/tools.items'

const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ')

export default function ToolsOverview() {
  const [q, setQ] = React.useState('')
  const [tab, setTab] = React.useState<'All' | Item['category']>('All')
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

  const searched = React.useMemo(() => searchItems(q), [q])

  const listByTab = React.useMemo(() => {
    if (tab === 'All') return searched.filter(i => i.href !== '/tools') // sembunyikan diri sendiri
    return searched.filter(i => i.category === tab && i.href !== '/tools')
  }, [searched, tab])

  const grouped = React.useMemo(() => groupByCategory(listByTab), [listByTab])

  const tabs = ['All', ...CATEGORY_ORDER.filter(c => c !== 'Main')] as const

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">All tools</h2>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools…"
            className="pl-8 h-9"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="flex flex-wrap gap-2">
            {tabs.map(t => (
              <TabsTrigger key={t} value={t} className="text-xs">{t}</TabsTrigger>
            ))}
          </TabsList>

          {tabs.map(t => (
            <TabsContent key={t} value={t} className="mt-4">
              {t === 'All' ? (
                <div className="grid gap-8">
                  {CATEGORY_ORDER.filter(c => c !== 'Main').map(cat => {
                    const list = grouped.get(cat as Item['category']) ?? []
                    if (!list.length) return null
                    return (
                      <section key={cat} className="grid gap-3">
                        <h3 className="text-sm font-semibold">{cat}</h3>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 items-stretch">
                          {list.map(tool => <ToolCard key={tool.href} tool={tool} />)}
                        </div>
                      </section>
                    )
                  })}
                  {!CATEGORY_ORDER.some(c => (grouped.get(c as Item['category']) ?? []).length) && (
                    <div className="text-sm text-muted-foreground">No results</div>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 items-stretch">
                  {(grouped.get(t as Item['category']) ?? []).map(tool => (
                    <ToolCard key={tool.href} tool={tool} />
                  ))}
                  {!((grouped.get(t as Item['category']) ?? []).length) && (
                    <div className="col-span-full text-sm text-muted-foreground">No results</div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

function ToolCard({ tool }: { tool: Item }) {
  const disabled = !tool.href

  return (
    <Card
      className={cx(
        'h-full flex flex-col rounded-2xl border border-border shadow-sm transition-all bg-card text-card-foreground',
        !disabled && 'hover:shadow-md hover:-translate-y-0.5'
      )}
    >
      <CardContent className="flex flex-col p-4">
        <div className="mt-1 flex items-center gap-3 min-h-[48px]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted ring-1 ring-border">
            {tool.icon}
          </span>
          <div className="text-sm font-semibold leading-tight">{tool.label}</div>
        </div>

        {tool.keywords?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tool.keywords.map((tg) => (
              <span
                key={tg}
                className="text-[11px] px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground"
              >
                {tg}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="mt-auto border-t border-border px-4 py-3">
        <div className="w-full flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{tool.category}</div>

          {disabled ? (
            <Button size="sm" variant="secondary" disabled>
              Open <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button asChild size="sm" variant="secondary" className="group">
              <Link href={tool.href} aria-label={`Open ${tool.label}`}>
                Open <ExternalLink className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
