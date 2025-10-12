'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Wand2, Play, Loader2, Copy, Check, Undo2, Redo2 } from 'lucide-react'

type PrettierApi = { format: (source: string, opts: any) => string }

export default function PrettierPage() {
  return (
    <Card className="border border-slate-200/80 rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          <CardTitle className="text-base font-semibold">Prettier Formatter</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <PrettierFormatter />
      </CardContent>
    </Card>
  )
}

function PrettierFormatter() {
  const [source, setSource] = React.useState<string>(`function hello(name){console.log("Hi, "+name) }`)
  const [formatted, setFormatted] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string>('')

  const [parser, setParser] = React.useState<'babel' | 'typescript' | 'json' | 'markdown' | 'html' | 'css'>('babel')
  const [semi, setSemi] = React.useState(true)
  const [singleQuote, setSingleQuote] = React.useState(false)
  const [tabWidth, setTabWidth] = React.useState(2)

  const [copied, setCopied] = React.useState(false)
  const copyOut = async () => {
    if (!formatted) return
    await navigator.clipboard.writeText(formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const formatNow = React.useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const prettier: PrettierApi = (await import('prettier/standalone')) as any
      const pBabel = await import('prettier/plugins/babel')
      const pEstree = await import('prettier/plugins/estree')
      const pTypescript = await import('prettier/plugins/typescript')
      const pHtml = await import('prettier/plugins/html')
      const pMarkdown = await import('prettier/plugins/markdown')
      const pPostcss = await import('prettier/plugins/postcss')
      const plugins = [pBabel, pEstree, pTypescript, pHtml, pMarkdown, pPostcss].map((m: any) => m.default || m)

      const out = (prettier as any).format(source, {
        parser,
        plugins,
        semi,
        singleQuote,
        tabWidth,
      })
      setFormatted(out)
    } catch (e: any) {
      setErr(e?.message || String(e))
      setFormatted('')
    } finally {
      setLoading(false)
    }
  }, [source, parser, semi, singleQuote, tabWidth])

  // Undo/Redo sederhana
  const [history, setHistory] = React.useState<string[]>([])
  const [future, setFuture] = React.useState<string[]>([])
  const onChangeSource = (val: string) => {
    setHistory((h) => [...h, source])
    setFuture([])
    setSource(val)
  }
  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h
      const prev = h[h.length - 1]
      setFuture((f) => [source, ...f])
      setSource(prev)
      return h.slice(0, -1)
    })
  }
  const redo = () => {
    setFuture((f) => {
      if (!f.length) return f
      const nxt = f[0]
      setHistory((h) => [...h, source])
      setSource(nxt)
      return f.slice(1)
    })
  }

  return (
    <div className="grid gap-4">
      <div className="grid md:grid-cols-4 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="parser">Parser</Label>
          <select
            id="parser"
            aria-label="Parser"
            className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
            value={parser}
            onChange={(e) => setParser(e.target.value as any)}
          >
            <option value="babel">JavaScript (Babel)</option>
            <option value="typescript">TypeScript</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="tabwidth">Tab Width</Label>
          <Input id="tabwidth" type="number" min={1} max={8} value={tabWidth}
                 onChange={(e) => setTabWidth(Number(e.target.value || 2))} />
        </div>

        <div className="flex items-center gap-6 pt-6 md:pt-0">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-purple-600" checked={semi} onChange={(e) => setSemi(e.target.checked)} />
            Semicolons
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-purple-600" checked={singleQuote} onChange={(e) => setSingleQuote(e.target.checked)} />
            Single quote
          </label>
        </div>

        <div className="flex items-end justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={undo}>
            <Undo2 className="h-4 w-4 mr-1" /> Undo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={redo}>
            <Redo2 className="h-4 w-4 mr-1" /> Redo
          </Button>
          <Button type="button" size="sm" onClick={formatNow} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
            Format
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="src">Source</Label>
          <Textarea id="src" className="min-h-[260px] font-mono" value={source}
                    onChange={(e) => onChangeSource(e.target.value)} placeholder={`// Paste your code here`} />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="out">Formatted</Label>
            <Button size="sm" variant="outline" onClick={copyOut}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Textarea id="out" className="min-h-[260px] font-mono" value={formatted} readOnly />
        </div>
      </div>

      {err && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {err} — Pastikan paket <code>prettier</code> & plugin parsers terpasang.
        </div>
      )}
      <Separator />
    </div>
  )
}
