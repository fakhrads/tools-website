'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Regex, Sparkles } from 'lucide-react'

type MatchInfo = {
  index: number
  match: string
  groups: (string | undefined)[]
}

function safeRegExp(pattern: string, flags: string): RegExp | null {
  try {
    return new RegExp(pattern, flags)
  } catch {
    return null
  }
}

function highlightMatches(text: string, re: RegExp | null) {
  if (!re) return <>{text}</>
  // clone flags with global to iterate
  const flags = re.flags.includes('g') ? re.flags : re.flags + 'g'
  const globalRe = new RegExp(re.source, flags)

  const chunks: React.ReactNode[] = []
  let lastIndex = 0
  let m: RegExpExecArray | null

  while ((m = globalRe.exec(text)) !== null) {
    const start = m.index
    const end = start + m[0].length
    if (start > lastIndex) chunks.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, start)}</span>)
    chunks.push(
      <mark key={`m-${start}-${end}`} className="rounded bg-primary/20 text-primary px-0.5 font-medium dark:bg-primary/30">
        {m[0]}
      </mark>
    )
    lastIndex = end
    // avoid zero-length infinite loops
    if (m[0].length === 0) globalRe.lastIndex++
  }
  if (lastIndex < text.length) chunks.push(<span key={`t-end`}>{text.slice(lastIndex)}</span>)
  return <>{chunks}</>
}

function collectMatches(text: string, re: RegExp | null): MatchInfo[] {
  if (!re) return []
  const flags = re.flags.includes('g') ? re.flags : re.flags + 'g'
  const globalRe = new RegExp(re.source, flags)
  const out: MatchInfo[] = []
  let m: RegExpExecArray | null
  while ((m = globalRe.exec(text)) !== null) {
    out.push({
      index: m.index,
      match: m[0],
      groups: Array.from(m).slice(1),
    })
    if (m[0].length === 0) globalRe.lastIndex++
  }
  return out
}

function explainRegex(pattern: string): string[] {
  const notes: string[] = []
  if (pattern.length === 0) return notes

  // Anchors
  if (/^\^/.test(pattern)) notes.push('^ : anchor ke awal string/baris')
  if (/\$$/.test(pattern)) notes.push('$ : anchor ke akhir string/baris')

  // Common tokens
  const tokenMap: Array<[RegExp, string]> = [
    [/(\\d)/g, '\\d : digit (0-9)'],
    [/(\\D)/g, '\\D : bukan digit'],
    [/(\\w)/g, '\\w : word-char (huruf, angka, underscore)'],
    [/(\\W)/g, '\\W : bukan word-char'],
    [/(\\s)/g, '\\s : spasi/whitespace'],
    [/(\\S)/g, '\\S : bukan whitespace'],
    [/(\.)/g, '. : karakter apa pun (kecuali newline, tergantung flag s)'],
    [/(\\b)/g, '\\b : word boundary'],
    [/(\\B)/g, '\\B : non-word boundary'],
  ]
  tokenMap.forEach(([re, desc]) => {
    if (re.test(pattern)) notes.push(desc)
  })

  // Character class & ranges
  if (/\[.*?\]/.test(pattern)) notes.push('[...] : character class (pilihan karakter)')
  if (/\[[^\]]*?-.*?\]/.test(pattern)) notes.push('a-z / A-Z / 0-9 : range karakter dalam class')

  // Quantifiers
  if (/\*/.test(pattern)) notes.push('* : 0 atau lebih')
  if (/\+/.test(pattern)) notes.push('+ : 1 atau lebih')
  if (/\?/.test(pattern)) notes.push('? : 0 atau 1 (atau non-greedy jika setelah quantifier)')
  if (/\{\d+(,\d*)?\}/.test(pattern)) notes.push('{m,n} : pengulangan dengan batas tertentu')

  // Groups
  if (/\((?!\?:)/.test(pattern)) notes.push('(...) : capturing group')
  if (/\(\?:/.test(pattern)) notes.push('(?:...) : non-capturing group')
  if (/\(\?=/.test(pattern)) notes.push('(?=...) : positive lookahead')
  if (/\(\?!/.test(pattern)) notes.push('(?!) : negative lookahead')
  if (/\(\?<=/.test(pattern)) notes.push('(?<=...) : positive lookbehind (dukungan engine tergantung)')
  if (/\(\?<!/.test(pattern)) notes.push('(?<!...) : negative lookbehind (dukungan engine tergantung)')

  return Array.from(new Set(notes))
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = React.useState<string>('^([A-Za-z]+)\\s(\\d+)$')
  const [flags, setFlags] = React.useState<string>('gm')
  const [text, setText] = React.useState<string>('Hello 123\nWorld 456')
  const re = safeRegExp(pattern, flags)
  const matches = React.useMemo(() => collectMatches(text, re), [text, re])
  const explanation = React.useMemo(() => explainRegex(pattern), [pattern])

  const errorMsg = !re ? 'Pattern atau flags tidak valid.' : null

  const copyMatches = async () => {
    const payload = JSON.stringify(matches, null, 2)
    await navigator.clipboard.writeText(payload)
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
          <Regex className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Regex Tester</h1>
          <p className="text-sm text-muted-foreground">Test, match, and explain regular expressions in real-time.</p>
        </div>
      </div>

      {/* Pattern panel */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">Pattern</span>
        </div>
        <div className="p-4 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="pattern">Regex Pattern</Label>
            <Input
              id="pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. ^[a-z]+$"
              className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="flags">Flags</Label>
            <Input
              id="flags"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="e.g. gimuy"
              className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl"
            />
            <div className="text-xs text-muted-foreground">g: global, i: ignore-case, m: multiline, s: dotAll, u: unicode, y: sticky</div>
          </div>
          {errorMsg && <p className="text-sm text-rose-600 dark:text-rose-400">{errorMsg}</p>}
        </div>
      </div>

      {/* Test Text panel */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">Test Text</span>
        </div>
        <div className="p-4 grid gap-3">
          <Textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl"
          />
          <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-sm font-mono leading-relaxed min-h-[80px]">
            {highlightMatches(text, re)}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Explainer panel */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
            <span className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Explainer
            </span>
          </div>
          <div className="p-4">
            {explanation.length === 0 ? (
              <p className="text-sm text-muted-foreground">No explanation — start typing a pattern.</p>
            ) : (
              <ul className="list-disc pl-5 text-sm">
                {explanation.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Matches & Groups panel */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
            <span className="text-sm font-medium">Matches</span>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="secondary" onClick={copyMatches} className="h-7 px-2.5 text-xs">
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy JSON
              </Button>
            </div>
          </div>
          <div className="p-4">
            <ScrollArea className="h-52 rounded-xl border border-border/60 bg-muted/40 p-3">
              <pre className="text-xs font-mono leading-relaxed">{JSON.stringify(matches, null, 2)}</pre>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}
