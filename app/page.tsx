'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from  '@/lib/utils' 
import { Hammer, Code2, Wrench, Info, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// ———————————————————————————————————————————————————————
// DevTools Starter Page (App Router)
// ———————————————————————————————————————————————————————

type TabKey = 'studio' | 'converters' | 'inspectors' | 'about'

const TABS: Array<{ key: TabKey; label: string; icon: React.ReactNode; desc?: string }> = [
  { key: 'studio', label: 'Studio', icon: <Hammer className="h-4 w-4" />, desc: 'Kumpulan utilitas (Prettier, JSONLint, dst.)' },
  { key: 'converters', label: 'Converters', icon: <Wrench className="h-4 w-4" />, desc: 'YAML⇄JSON, Base64, URL encode/decode' },
  { key: 'inspectors', label: 'Inspectors', icon: <Code2 className="h-4 w-4" />, desc: 'Regex tester, JWT decoder' },
  { key: 'about', label: 'About', icon: <Info className="h-4 w-4" />, desc: 'Info stack & roadmap' },
]

export default function Page() {
  const params = useSearchParams()
  const router = useRouter()
  const current = (params.get('tab') as TabKey) || 'studio'

  const setTab = (key: TabKey) => {
    const sp = new URLSearchParams(params.toString())
    sp.set('tab', key)
    router.replace(`?${sp.toString()}`)
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between py-4">
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
              {/* Dummy quick search (bebas kamu ganti/extend) */}
              <Input placeholder="Cari tool… (coming soon)" className="w-56" />
              <Button variant="secondary" size="sm">Feedback</Button>
            </div>
          </div>
        </div>

        {/* Navbar */}
        <nav className="border-t">
          <div className="mx-auto max-w-6xl px-4">
            <ul className="flex gap-2 overflow-x-auto py-2">
              {TABS.map((t) => {
                const active = current === t.key
                return (
                  <li key={t.key}>
                    <button
                      onClick={() => setTab(t.key)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                        active
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {current === 'studio' && <StudioSlot />}
        {current === 'converters' && <ConvertersSlot />}
        {current === 'inspectors' && <InspectorsSlot />}
        {current === 'about' && <AboutSection />}
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
          Made with ❤️ · Runs on Next.js App Router · Tailwind + shadcn/ui
        </div>
      </footer>
    </div>
  )
}

/** ======= SLOTS: taruh tools-mu di sini ======= */

/** Studio: tempatkan komponen utama berisi kumpulan tools (mis. DevToolsStudio) */
function StudioSlot() {
  return (
    <Card className="border border-slate-200/70 shadow-sm rounded-2xl">
      <CardContent className="p-4 md:p-6">
        {/* ——— jika kamu sudah punya komponen lengkap (dari canvas), cukup ganti baris di bawah menjadi:
              <DevToolsStudio />
            ——————————————————————————————————————————————————————— */}
        <EmptyMount
          title="Pasang komponen Studio-mu di sini"
          desc="Import komponen DevTools (mis. DevToolsStudio) dan render di slot ini."
          code={[
            `import DevToolsStudio from '@/app/tools/_components/devtools-studio'`,
            `// ...`,
            `<DevToolsStudio />`,
          ]}
        />
      </CardContent>
    </Card>
  )
}

/** Converters: YAML⇄JSON, Base64, URL encode/decode (placeholder siap diisi) */
function ConvertersSlot() {
  return (
    <SectionCard
      title="Converters"
      desc="Koleksi konversi cepat — tambahkan modul per konverter."
      items={[
        { label: 'YAML ⇄ JSON', hint: 'Planner siap pakai' },
        { label: 'Base64 encode/decode', hint: 'Web APIs, atob/btoa' },
        { label: 'URL encode/decode', hint: 'decodeURIComponent' },
      ]}
    />
  )
}

/** Inspectors: Regex tester, JWT decoder (placeholder siap diisi) */
function InspectorsSlot() {
  return (
    <SectionCard
      title="Inspectors"
      desc="Analisis string/token tanpa kirim data ke server."
      items={[
        { label: 'Regex Tester', hint: 'Live match & groups' },
        { label: 'JWT Decoder', hint: 'atob header/payload' },
      ]}
    />
  )
}

/** About: informasi stack & roadmap singkat */
function AboutSection() {
  return (
    <Card className="border border-slate-200/70 shadow-sm rounded-2xl">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold">Tentang & Roadmap</h2>
        <p className="text-sm text-slate-600 mt-1">
          Semua proses berjalan di browser (client-side) — cepat, aman, dan bisa offline.
        </p>

        <div className="mt-4 grid gap-3">
          <Row title="Stack UI" content="Next.js App Router · Tailwind · shadcn/ui · lucide-react" />
          <Row title="Formatter" content="prettier/standalone + parser lazy import per bahasa" />
          <Row
            title="Rencana Tool"
            content="Prettier, JSON Lint, YAML⇄JSON, Base64/URL, Regex tester, JWT decoder, Diff viewer, UUID/Hash"
          />
        </div>
      </CardContent>
    </Card>
  )
}

/** ======= Util Components ======= */

function Row({ title, content }: { title: string; content: string }) {
  return (
    <div className="flex items-start gap-3">
      <ChevronRight className="h-4 w-4 mt-1 text-slate-400" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-slate-600">{content}</p>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  desc,
  items,
}: {
  title: string
  desc?: string
  items?: Array<{ label: string; hint?: string }>
}) {
  return (
    <Card className="border border-slate-200/70 shadow-sm rounded-2xl">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          {desc && <p className="text-sm text-slate-600 mt-1">{desc}</p>}
        </div>
        <div className="grid gap-2">
          {items?.map((it) => (
            <div
              key={it.label}
              className="flex items-center justify-between rounded-xl border bg-slate-50 py-2 px-3 text-sm"
            >
              <span className="font-medium">{it.label}</span>
              <span className="text-slate-500">{it.hint}</span>
            </div>
          )) || null}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyMount({
  title,
  desc,
  code,
}: {
  title: string
  desc?: string
  code?: string[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-semibold">{title}</h2>
      {desc && <p className="text-sm text-slate-600">{desc}</p>}
      {code && (
        <pre className="rounded-xl bg-slate-900 text-slate-50 text-xs p-4 overflow-x-auto">
{code.map((line) => `> ${line}`).join('\n')}
        </pre>
      )}
      <div className="text-xs text-slate-500">
        Catatan: Slot ini akan tetap tampil meski komponen tools belum di-import, jadi aman untuk CI/build.
      </div>
    </div>
  )
}
