'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Timer, BookOpen, FileJson } from 'lucide-react'

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
    <section className="grid gap-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5" />
        <h1 className="text-xl font-semibold">Word Counter & Read-Time</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teks</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Label htmlFor="wc-text" className="text-sm">Masukkan teks</Label>
          <Textarea id="wc-text" rows={10} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setText('')}>Clear</Button>
            <Button onClick={copyStats}><Copy className="mr-2 h-4 w-4" /> Copy Stats (JSON)</Button>
            <Button variant="outline" onClick={downloadJSON}><FileJson className="mr-2 h-4 w-4" /> Download</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistik</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
            <li className="rounded border p-3">
              <div className="text-xs text-muted-foreground">Kata</div>
              <div className="text-xl font-semibold">{stats.words}</div>
            </li>
            <li className="rounded border p-3">
              <div className="text-xs text-muted-foreground">Karakter (dengan spasi)</div>
              <div className="text-xl font-semibold">{stats.charsWithSpaces}</div>
            </li>
            <li className="rounded border p-3">
              <div className="text-xs text-muted-foreground">Karakter (tanpa spasi)</div>
              <div className="text-xl font-semibold">{stats.charsNoSpaces}</div>
            </li>
            <li className="rounded border p-3">
              <div className="text-xs text-muted-foreground">Kalimat</div>
              <div className="text-xl font-semibold">{stats.sentences}</div>
            </li>
            <li className="rounded border p-3">
              <div className="text-xs text-muted-foreground">Paragraf</div>
              <div className="text-xl font-semibold">{stats.paragraphs}</div>
            </li>
            <li className="rounded border p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Timer className="h-3.5 w-3.5" /> Perkiraan baca</div>
              <div className="text-xl font-semibold">~{stats.readingTimeMin} menit</div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}
