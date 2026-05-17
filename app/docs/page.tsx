'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { BookOpen, Search, Wand2, Play, Copy, RotateCcw, Settings2 } from 'lucide-react'

const guides = [
  {
    id: 'pick',
    icon: Wand2,
    title: 'Pilih tool yang kamu butuhkan',
    desc: 'Buka halaman Tools dan pilih fitur seperti JSON Lint, UUID Generator, atau Regex Tester.',
    steps: [
      'Klik menu "Tools" di navigasi utama.',
      'Pilih tool sesuai kebutuhan kamu.',
      'Setiap tool memiliki tampilan dan fungsi yang berbeda.',
    ],
    keywords: ['tools', 'pilih', 'json', 'uuid', 'regex', 'navigasi'],
  },
  {
    id: 'run',
    icon: Play,
    title: 'Masukkan data dan jalankan',
    desc: 'Tempelkan input sesuai tool yang dipilih lalu tekan tombol proses.',
    steps: [
      'Tempelkan teks atau data yang ingin diuji.',
      'Tekan tombol "Format", "Lint", atau "Run".',
      'Hasil muncul otomatis di area output.',
    ],
    keywords: ['input', 'data', 'format', 'lint', 'run', 'output', 'proses'],
  },
  {
    id: 'copy',
    icon: Copy,
    title: 'Salin atau simpan hasil',
    desc: 'Salin hasil ke clipboard atau unduh ke file sesuai format yang tersedia.',
    steps: [
      'Klik tombol "Copy" untuk menyalin ke clipboard.',
      'Gunakan "Download" jika tersedia untuk menyimpan file.',
      'Beberapa tool mendukung export ke .json, .txt, atau .png.',
    ],
    keywords: ['copy', 'salin', 'simpan', 'download', 'export', 'clipboard', 'file'],
  },
  {
    id: 'reset',
    icon: RotateCcw,
    title: 'Reset kapan saja',
    desc: 'Bersihkan input dan output dengan tombol reset — semua aman di sisi client.',
    steps: [
      'Klik ikon "Reset" untuk mengosongkan input/output.',
      'Semua proses dilakukan di browser — data tidak dikirim ke server.',
    ],
    keywords: ['reset', 'bersih', 'hapus', 'clear', 'client', 'browser', 'aman'],
  },
  {
    id: 'personalize',
    icon: Settings2,
    title: 'Personalisasi pengalaman',
    desc: 'Gunakan dark/light mode dan fitur pin untuk menyimpan tool favorit.',
    steps: [
      'Toggle tema gelap/terang di navbar kanan atas.',
      'Pin tool favorit dari halaman utama untuk akses cepat.',
    ],
    keywords: ['dark', 'light', 'tema', 'pin', 'favorit', 'personalisasi', 'mode'],
  },
]

export default function DocsPage() {
  const [q, setQ] = React.useState('')

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return guides
    return guides.filter(
      g =>
        g.title.toLowerCase().includes(term) ||
        g.desc.toLowerCase().includes(term) ||
        g.keywords.some(k => k.includes(term)) ||
        g.steps.some(s => s.toLowerCase().includes(term))
    )
  }, [q])

  return (
    <div className="max-w-6xl grid gap-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panduan Penggunaan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Langkah-langkah dasar menggunakan DevTools Studio secara efisien.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Cari panduan…"
          className="pl-9 rounded-xl bg-muted/60 border-border/60 focus-visible:ring-primary/50"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Accordion */}
      {filtered.length > 0 ? (
        <Accordion type="multiple" className="grid gap-2">
          {filtered.map((g) => (
            <AccordionItem
              key={g.id}
              value={g.id}
              className="rounded-2xl border border-border/60 bg-card px-1 overflow-hidden data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="flex items-center gap-3 px-4 py-4 hover:no-underline group [&>svg]:text-muted-foreground [&>svg]:shrink-0">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-border/60 text-muted-foreground group-data-[state=open]:bg-accent group-data-[state=open]:text-primary group-data-[state=open]:ring-primary/30 transition-colors">
                  <g.icon className="h-4 w-4" />
                </span>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-foreground">{g.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{g.desc}</div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                <div className="ml-11 grid gap-3">
                  <p className="text-sm text-muted-foreground">{g.desc}</p>
                  <ul className="grid gap-2">
                    {g.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-7 w-7 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium">Panduan tidak ditemukan</p>
          <p className="text-xs text-muted-foreground mt-1">Coba kata kunci lain</p>
        </div>
      )}

      {/* Count */}
      {q && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground -mt-4">
          {filtered.length} dari {guides.length} panduan ditemukan
        </p>
      )}
    </div>
  )
}
