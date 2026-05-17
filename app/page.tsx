'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Braces, Zap, Shield, Puzzle, Clock, ChevronRight } from 'lucide-react'
import { TOOLS, type ToolItem } from '@/lib/tools-catalog'

export default function HomePage() {
  const router = useRouter()
  const [recent, setRecent] = React.useState<Array<{ id: string; at: number }>>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem('tools_recent') || '[]'))
    } catch {}
    setMounted(true)
  }, [])

  const recentTools = React.useMemo(
    () => recent.slice(0, 4).map(r => TOOLS.find(t => t.id === r.id)).filter((t): t is ToolItem => !!t),
    [recent]
  )

  const openTool = (t: ToolItem) => {
    try {
      const now = Date.now()
      const list = [{ id: t.id, at: now }, ...recent.filter(x => x.id !== t.id)].slice(0, 12)
      setRecent(list)
      localStorage.setItem('tools_recent', JSON.stringify(list))
    } catch {}
    router.push(t.href)
  }

  return (
    <div className="grid gap-16">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card px-8 py-14 sm:px-14 sm:py-20">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(55%_40%_at_50%_-5%,oklch(0.68_0.18_277/0.18),transparent)]" />
        <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-violet-500/8 blur-3xl" />

        <div className="relative flex flex-col items-start gap-6 max-w-2xl">
          <Badge className="rounded-full bg-primary/10 text-primary border-primary/20 gap-1.5 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {TOOLS.length} tools available
          </Badge>

          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15]">
              Developer tools,{' '}
              <span className="bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 bg-clip-text text-transparent">
                all in one place
              </span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-lg leading-relaxed">
              Fast, private, runs entirely in your browser.
              <br></br>
              No install, no account, no data leaving your machine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 gap-2">
              <Link href="/tools">
                Browse Tools <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl border-border/60 gap-2">
              <Link href="/docs">
                How it works
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Recent tools (only if user has history) ── */}
      {mounted && recentTools.length > 0 && (
        <section className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Pick up where you left off</h2>
            </div>
            <Link
              href="/tools"
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              All tools <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentTools.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => openTool(t)}
                className="group text-left flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-150"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-border/60 text-muted-foreground group-hover:text-primary group-hover:bg-accent transition-colors">
                  {t.icon ?? <Braces className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.category}</div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Feature highlights ── */}
      <section className="grid gap-5">
        <div>
          <h2 className="text-base font-semibold">Why DevTools Studio?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Built for developers who value speed and privacy.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Zap className="h-4 w-4" />}
            title="Zero latency"
            desc="Everything runs in the browser — instant results, works fully offline."
          />
          <FeatureCard
            icon={<Shield className="h-4 w-4" />}
            title="Privacy first"
            desc="Your data never leaves your device. No tracking, no telemetry."
          />
          <FeatureCard
            icon={<Puzzle className="h-4 w-4" />}
            title="Extensible"
            desc="Add a new tool in seconds — register it in the catalog and it appears everywhere."
          />
        </div>
      </section>

    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
