'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Hammer, Sparkles, ArrowRight, Wand2, FileJson, Braces, Star, Clock, ChevronRight
} from 'lucide-react'

type MiniTool = { id: string; title: string; href: string; icon: React.ReactNode }

const CATALOG: MiniTool[] = [
  { id: 'prettier', title: 'Code Prettier', href: '/tools/prettier', icon: <Wand2 className="h-4 w-4" /> },
  { id: 'jsonlint', title: 'JSON Lint', href: '/tools/json-lint', icon: <FileJson className="h-4 w-4" /> },
]

export default function HomePage() {
  const router = useRouter()
  const [q, setQ] = React.useState('')

  // pinned & recent dari localStorage (format yang sudah dipakai di halaman tools)
  const [pinned, setPinned] = React.useState<string[]>([])
  const [recent, setRecent] = React.useState<Array<{ id: string; at: number }>>([])

  React.useEffect(() => {
    try {
      setPinned(JSON.parse(localStorage.getItem('tools_fav') || '[]'))
      setRecent(JSON.parse(localStorage.getItem('tools_recent') || '[]'))
    } catch {}
  }, [])

  const toolById = React.useCallback((id: string) => CATALOG.find(t => t.id === id), [])
  const recentTools = recent
    .map(r => toolById(r.id))
    .filter(Boolean) as MiniTool[]
  const pinnedTools = pinned
    .map(id => toolById(id))
    .filter(Boolean) as MiniTool[]

  const goSearch = () => router.push(q ? `/tools?q=${encodeURIComponent(q)}` : '/tools')

  return (
    <div className="grid gap-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> New: Prettier Formatter
              </Badge>
              <span className="text-xs text-slate-500">+ JSON Lint</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              DevTools Studio
            </h1>
            <p className="mt-2 text-slate-600">
              Satu tempat untuk format, lint, dan utilitas developer harian—cepat, ringan, dan nyaman dipakai.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/tools">
                  <Hammer className="h-4 w-4 mr-1" /> Open Tools <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <div className="relative">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && goSearch()}
                  placeholder="Search tools…"
                  className="pl-9 w-72 max-w-full"
                />
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none"><path d="m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <span className="text-xs text-slate-500">Tip: ⌘/Ctrl+K untuk command palette (coming)</span>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-right">
            <div className="text-3xl font-semibold">{CATALOG.length}</div>
            <div className="text-xs text-slate-500">tools available</div>
          </div>
        </div>

        {/* quick actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATALOG.map(t => (
            <Link key={t.id} href={t.href} className="group">
              <Card className="rounded-2xl border hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200">
                      {t.icon ?? <Braces className="h-4 w-4" />}
                    </span>
                    <div className="text-sm font-medium">{t.title}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* PINNED & RECENT */}
      {(pinnedTools.length > 0 || recentTools.length > 0) && (
        <section className="grid gap-6">
          {pinnedTools.length > 0 && (
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <h3 className="text-sm font-semibold">Pinned</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pinnedTools.map(t => <MiniToolCard key={t.id} tool={t} />)}
              </div>
            </div>
          )}

          {recentTools.length > 0 && (
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold">Recently used</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentTools.slice(0, 6).map(t => <MiniToolCard key={t.id} tool={t} />)}
              </div>
            </div>
          )}
        </section>
      )}

      {/* FEATURES */}
      <section className="grid gap-3">
        <h3 className="text-sm font-semibold">Why DevTools Studio?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <FeatureCard
            title="Fast & lightweight"
            desc="Semua berjalan di browser. Import modular, UI responsif."
          />
          <FeatureCard
            title="Consistent UX"
            desc="Komponen seragam (shadcn/ui), shortcut keyboard, state yang jelas."
          />
          <FeatureCard
            title="Extensible"
            desc="Mudah menambah tool baru—cukup daftarkan card dan route."
          />
        </div>
      </section>
    </div>
  )
}

/* --- small presentational components --- */
function MiniToolCard({ tool }: { tool: MiniTool }) {
  return (
    <Link href={tool.href} className="group">
      <Card className="rounded-2xl border hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200">
              {tool.icon ?? <Braces className="h-4 w-4" />}
            </span>
            <div className="text-sm font-medium">{tool.title}</div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </CardContent>
      </Card>
    </Link>
  )
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card className="rounded-2xl border">
      <CardContent className="p-4">
        <div className="text-sm font-semibold">{title}</div>
        <p className="mt-1 text-sm text-slate-600">{desc}</p>
      </CardContent>
    </Card>
  )
}
