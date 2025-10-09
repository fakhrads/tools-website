'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronRight, Clipboard, Check } from 'lucide-react'

// util cn (fallback)
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

type TabKey = 'studio' | 'converters' | 'inspectors' | 'about'

export default function ToolsPage() {
  const params = useSearchParams()
  const tab = (params.get('tab') as TabKey) || 'studio'

  return (
    <div className="space-y-4">
      {tab === 'studio' && <StudioSlot />}
      {tab === 'converters' && <ConvertersSlot />}
      {tab === 'inspectors' && <InspectorsSlot />}
      {tab === 'about' && <AboutSection />}
    </div>
  )
}

/** ======= SLOTS: taruh tools-mu di sini ======= */

function StudioSlot() {
  return (
    <Card className="border border-slate-200/70 shadow-sm rounded-2xl">
      <CardContent className="p-4 md:p-6">
        {/* Ganti ini dengan komponen studio milikmu:
            import DevToolsStudio from './_components/devtools-studio'
            <DevToolsStudio />
        */}
        <EmptyMount
          title="Pasang komponen Studio-mu di sini"
          desc="Import komponen DevTools (mis. DevToolsStudio) dan render di slot ini."
          code={[
            `import DevToolsStudio from '@/app/tools/_components/devtools-studio'`,
            `<DevToolsStudio />`,
          ]}
        />
      </CardContent>
    </Card>
  )
}

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
  const [copied, setCopied] = React.useState(false)
  const text = (code || []).join('\n')

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-semibold">{title}</h2>
      {desc && <p className="text-sm text-slate-600">{desc}</p>}
      {code && (
        <div className="relative">
          <pre className="rounded-xl bg-slate-900 text-slate-50 text-xs p-4 overflow-x-auto">
{`> ${code.join('\n> ')}`}
          </pre>
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={async () => {
              await navigator.clipboard.writeText(text)
              setCopied(true)
              setTimeout(() => setCopied(false), 1200)
            }}
          >
            {copied ? <><Check className="h-4 w-4 mr-1" />Copied</> : <><Clipboard className="h-4 w-4 mr-1" />Copy</>}
          </Button>
        </div>
      )}
      <div className="text-xs text-slate-500">
        Catatan: Slot ini akan tetap tampil meski komponen tools belum di-import, jadi aman untuk CI/build.
      </div>
    </div>
  )
}
