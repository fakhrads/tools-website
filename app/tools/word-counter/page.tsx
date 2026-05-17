'use client'

import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Copy, Timer, BookOpen, FileJson, X } from 'lucide-react'

type Stats = {
  words: number
  charsWithSpaces: number
  charsNoSpaces: number
  sentences: number
  paragraphs: number
  readingTimeMin: number
}

const WPM = 200 // asumsi rata-rata

function computeStats(text: string): Stats {
  const trimmed = text.trim()
  const words = trimmed ? (trimmed.match(/\S+/g) || []).length : 0
  const charsWithSpaces = text.length
  const charsNoSpaces = text.replace(/\s/g, '').length
  const sentences = trimmed ? (trimmed.match(/[.!?]+(\s|$)/g) || []).length || (words > 0 ? 1 : 0) : 0
  const paragraphs = trimmed ? trimmed.split(/\n{2,}/).filter(Boolean).length : 0
  const readingTimeMin = Math.max(1, Math.ceil(words / WPM)) // bulatkan ke atas, min 1
  return { words, charsWithSpaces, charsNoSpaces, sentences, paragraphs, readingTimeMin }
}

export default function WordCounterPage() {
  const [text, setText] = React.useState<string>('')
  const stats = React.useMemo(() => computeStats(text), [text])

  const copyStats = async () => {
    await navigator.clipboard.writeText(JSON.stringify(stats, null, 2))
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify({ text, stats }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'word-counter.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Word Counter</h1>
          <p className="text-sm text-muted-foreground">Count words, characters, sentences, and estimate reading time.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">Input Text</span>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" onClick={() => setText('')}>
              <X className="h-3.5 w-3.5 mr-1.5" /> Clear
            </Button>
            <Button size="sm" variant="ghost" onClick={copyStats}>
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Stats
            </Button>
            <Button size="sm" variant="ghost" onClick={downloadJSON}>
              <FileJson className="h-3.5 w-3.5 mr-1.5" /> Download
            </Button>
          </div>
        </div>
        <div className="p-4">
          <Textarea
            id="wc-text"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">Statistics</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="text-xs text-muted-foreground">Kata</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{stats.words}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="text-xs text-muted-foreground">Karakter (dengan spasi)</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{stats.charsWithSpaces}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="text-xs text-muted-foreground">Karakter (tanpa spasi)</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{stats.charsNoSpaces}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="text-xs text-muted-foreground">Kalimat</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{stats.sentences}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="text-xs text-muted-foreground">Paragraf</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{stats.paragraphs}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Timer className="h-3.5 w-3.5" /> Perkiraan baca</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">~{stats.readingTimeMin} menit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
