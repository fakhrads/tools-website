'use client'

import { Badge } from '@/components/ui/badge'
import { ScrollText } from 'lucide-react'

type ChangeType = 'new' | 'fix' | 'improve'

type LogEntry = {
  version: string
  date: string
  label?: string
  changes: { type: ChangeType; text: string }[]
}

const TYPE_META: Record<ChangeType, { label: string; color: string }> = {
  new:     { label: 'New',     color: 'bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20' },
  fix:     { label: 'Fix',     color: 'bg-rose-50 text-rose-600 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20' },
  improve: { label: 'Improve', color: 'bg-sky-50 text-sky-600 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20' },
}

const changelogs: LogEntry[] = [
  {
    version: 'v1.4.0',
    date: 'Mei 2026',
    label: 'Latest',
    changes: [
      { type: 'new',     text: 'Redesign menyeluruh — floating navbar, bottom mobile nav' },
      { type: 'new',     text: 'Halaman /tools dengan category sections berwarna' },
      { type: 'improve', text: 'Enterprise SaaS color palette (indigo primary, deep navy dark)' },
      { type: 'improve', text: 'Breadcrumb navigation di individual tool pages' },
    ],
  },
  {
    version: 'v1.3.0',
    date: 'April 2026',
    changes: [
      { type: 'new',     text: 'Cron Builder dengan preview expression' },
      { type: 'new',     text: 'Timezone Converter' },
      { type: 'new',     text: 'CSV to JSON Converter, Regex Tester, Word Counter' },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'Oktober 2025',
    changes: [
      { type: 'new',     text: 'Halaman Dokumentasi dan Changelog' },
      { type: 'fix',     text: 'UI JSON Lint di mobile (responsive)' },
      { type: 'improve', text: 'Performa layout Tools' },
    ],
  },
  {
    version: 'v1.1.0',
    date: 'Oktober 2025',
    changes: [
      { type: 'new',     text: 'Sidebar navigasi di halaman Tools' },
      { type: 'improve', text: 'Migrasi penuh ke App Router' },
      { type: 'fix',     text: 'Warna tema dan tombol aksi' },
    ],
  },
  {
    version: 'v1.0.0',
    date: 'Oktober 2025',
    changes: [
      { type: 'new',     text: 'Rilis awal DevTools Studio' },
      { type: 'new',     text: 'JSON Lint, UUID Generator, Code Prettier' },
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="max-w-2xl grid gap-10">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
          <ScrollText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Changelog</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Riwayat perubahan setiap versi DevTools Studio.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <ol className="relative grid gap-0">
        {changelogs.map((log, idx) => (
          <li key={idx} className="relative flex gap-6 pb-10 last:pb-0">
            {/* Line */}
            {idx < changelogs.length - 1 && (
              <div className="absolute left-3 top-7 bottom-0 w-px bg-border" />
            )}

            {/* Dot */}
            <div className="relative shrink-0 mt-1">
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${idx === 0 ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}>
                <div className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 grid gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">{log.version}</span>
                {log.label && (
                  <Badge className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-primary/10 text-primary border-primary/20 ring-0">
                    {log.label}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">{log.date}</span>
              </div>

              <ul className="grid gap-2">
                {log.changes.map((c, i) => {
                  const meta = TYPE_META[c.type]
                  return (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 shrink-0 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-muted-foreground">{c.text}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
