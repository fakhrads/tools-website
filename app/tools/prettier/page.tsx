'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Wand2, Play, Loader2, Copy, Check, Undo2, Redo2, Download, Eye, Code2
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle
} from '@/components/ui/dialog'

type PrettierApi = { format: (source: string, opts: any) => string | Promise<string> }

const PANEL_H = 'h-[220px] sm:h-[260px] md:h-[320px]'
const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ')
const downloadText = (filename: string, text: string) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
}
const inferExt = (parser: string) =>
  parser === 'typescript' ? 'ts' :
  parser === 'json' ? 'json' :
  parser === 'markdown' ? 'md' :
  parser === 'html' ? 'html' :
  parser === 'css' ? 'css' : 'js'

function CarbonPreview({
  code, language, filename, open, onOpenChange
}: { code: string; language: string; filename: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [hlOk, setHlOk] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    if (!open) return
    ;(async () => {
      try {
        const hljs = (await import('highlight.js/lib/core')).default
        const map: Record<string,string> = { babel:'javascript', javascript:'javascript', typescript:'typescript', json:'json', markdown:'markdown', html:'xml', css:'css' }
        const lang = map[language] ?? 'javascript'
        const mod = await import(`highlight.js/lib/languages/${lang}.js`)
        hljs.registerLanguage(lang, (mod as any).default || mod)
        document.querySelectorAll('pre code.hljsable').forEach((el) => {
          try { hljs.highlightElement(el as HTMLElement) } catch {}
        })
        if (mounted) setHlOk(true)
      } catch { setHlOk(false) }
    })()
    return () => { mounted = false }
  }, [open, language])

  const doDownloadPng = async () => {
    if (!ref.current) return
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true, backgroundColor: '#0b1220' })
      const a = document.createElement('a'); a.href = dataUrl; a.download = (filename || 'snippet') + '.png'; a.click()
    } catch {
      await navigator.clipboard.writeText(code)
      alert('html-to-image belum terpasang. Teks telah disalin ke clipboard sebagai fallback.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(920px,96vw)]">
        <DialogHeader>
          <DialogTitle>Carbon Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div
            ref={ref}
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#0b1220 0%, #0f172a 60%, #1e293b 100%)', padding: 24 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="ml-3 text-xs text-slate-300 font-medium truncate">{filename || 'snippet.' + inferExt(language)}</div>
            </div>

            <div className="rounded-xl bg-[#0a0f1a]/70 ring-1 ring-white/10 p-4">
              <pre className="m-0 overflow-auto max-h-[60vh]">
                <code className={cx('block text-sm leading-relaxed text-slate-200', hlOk && 'hljsable')}>{code}</code>
              </pre>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Tip: Klik "Download PNG" untuk menyimpan gambar beresolusi tinggi.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button onClick={doDownloadPng}><Download className="h-4 w-4 mr-1" /> Download PNG</Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function PrettierPage() {
  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
          <Wand2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Code Prettier</h1>
          <p className="text-sm text-muted-foreground">Format JavaScript, TypeScript, JSON, HTML, CSS, and Markdown — powered by Prettier.</p>
        </div>
      </div>

      <PrettierFormatter />
    </div>
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
  const [autoFormat, setAutoFormat] = React.useState(false)
  const [filename, setFilename] = React.useState<string>('snippet.' + inferExt(parser))

  const [isJsonValid, setIsJsonValid] = React.useState<boolean | null>(null)
  React.useEffect(() => {
    if (parser !== 'json') { setIsJsonValid(null); return }
    try { JSON.parse(source); setIsJsonValid(true) } catch { setIsJsonValid(false) }
  }, [parser, source])

  const [copied, setCopied] = React.useState(false)
  const copyOut = async () => {
    if (!formatted) return
    await navigator.clipboard.writeText(formatted)
    setCopied(true); setTimeout(() => setCopied(false), 1200)
  }

  const formatNow = React.useCallback(async () => {
    setLoading(true); setErr('')
    try {
      const prettier: PrettierApi = (await import('prettier/standalone')) as any
      const pBabel = await import('prettier/plugins/babel')
      const pEstree = await import('prettier/plugins/estree')
      const pTypescript = await import('prettier/plugins/typescript')
      const pHtml = await import('prettier/plugins/html')
      const pMarkdown = await import('prettier/plugins/markdown')
      const pPostcss = await import('prettier/plugins/postcss')
      const plugins = [pBabel, pEstree, pTypescript, pHtml, pMarkdown, pPostcss].map((m: any) => m.default || m)

      const out = await (prettier as any).format(source, {
        parser, plugins, semi, singleQuote, tabWidth,
      })

      setFormatted(out)
      if (parser === 'json') {
        try { JSON.parse(out); setIsJsonValid(true) } catch { setIsJsonValid(false) }
      }
    } catch (e: any) {
      setErr(e?.message || String(e)); setFormatted('')
    } finally {
      setLoading(false)
    }
  }, [source, parser, semi, singleQuote, tabWidth])

  React.useEffect(() => {
    if (!autoFormat) return
    const t = setTimeout(() => { formatNow() }, 350)
    return () => clearTimeout(t)
  }, [source, parser, semi, singleQuote, tabWidth, autoFormat, formatNow])

  const [history, setHistory] = React.useState<string[]>([])
  const [future, setFuture] = React.useState<string[]>([])
  const onChangeSource = (val: string) => { setHistory((h) => [...h, source]); setFuture([]); setSource(val) }
  const undo = () => setHistory((h) => { if (!h.length) return h; const prev = h[h.length - 1]; setFuture((f) => [source, ...f]); setSource(prev); return h.slice(0, -1) })
  const redo = () => setFuture((f) => { if (!f.length) return f; const nxt = f[0]; setHistory((h) => [...h, source]); setSource(nxt); return f.slice(1) })

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return
      if (e.key === 'Enter') { e.preventDefault(); formatNow() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [formatNow])

  React.useEffect(() => {
    const ext = inferExt(parser)
    setFilename((prev) => {
      const dot = prev.lastIndexOf('.')
      return (dot > 0 ? prev.slice(0, dot) : prev) + '.' + ext
    })
  }, [parser])

  const [showDiff, setShowDiff] = React.useState(false)
  const diffLines = React.useMemo(() => {
    if (!showDiff) return []
    const a = source.split('\n'), b = (formatted || '').split('\n')
    const max = Math.max(a.length, b.length)
    const rows: { left?: string; right?: string; s: 'same' | 'add' | 'del' | 'mod' }[] = []
    for (let i = 0; i < max; i++) {
      const L = a[i] ?? '', R = b[i] ?? ''
      if (L === R) rows.push({ left: L, right: R, s: 'same' })
      else if (!L && R) rows.push({ right: R, s: 'add' })
      else if (L && !R) rows.push({ left: L, s: 'del' })
      else rows.push({ left: L, right: R, s: 'mod' })
    }
    return rows
  }, [showDiff, source, formatted])

  const [previewOpen, setPreviewOpen] = React.useState(false)

  return (
    <>
      <div className="grid gap-4">
        {/* Options/controls area */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
              <div className="grid gap-1.5">
                <Label htmlFor="parser">Parser</Label>
                <select
                  id="parser"
                  aria-label="Parser"
                  className="h-9 rounded-xl bg-muted/40 border border-border/60 focus:ring-primary/50 px-2 text-sm"
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

              <div className="flex items-center gap-5 pt-1">
                <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                  <input type="checkbox" className="accent-purple-600" checked={semi} onChange={(e) => setSemi(e.target.checked)} />
                  Semicolons
                </label>
                <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                  <input type="checkbox" className="accent-purple-600" checked={singleQuote} onChange={(e) => setSingleQuote(e.target.checked)} />
                  Single quote
                </label>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <Label htmlFor="autoformat" className="text-xs text-muted-foreground">Auto-format</Label>
                  <Switch id="autoformat" checked={autoFormat} onCheckedChange={setAutoFormat} />
                </div>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={undo} title="Undo">
                <Undo2 className="h-4 w-4 mr-1" /> Undo
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={redo} title="Redo">
                <Redo2 className="h-4 w-4 mr-1" /> Redo
              </Button>
              <Button type="button" size="sm" onClick={formatNow} disabled={loading} title="Format (⌘/Ctrl+Enter)">
                {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
                Format
              </Button>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-2 py-0.5">
                <Code2 className="h-3.5 w-3.5 mr-1" /> {parser.toUpperCase()}
              </Badge>
              {isJsonValid !== null && (
                <Badge
                  variant="outline"
                  className={cx(
                    'px-2 py-0.5 border',
                    isJsonValid
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                      : 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                  )}
                >
                  {isJsonValid ? 'Valid JSON' : 'Invalid JSON'}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input value={filename} onChange={(e) => setFilename(e.target.value)} className="h-9 w-[200px]" title="Filename" />
              <Button variant="outline" size="sm" onClick={copyOut} title="Copy formatted">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadText(filename, formatted || source)} title="Download">
                <Download className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={() => setPreviewOpen(true)} title="Carbon-style preview">
                <Eye className="h-4 w-4 mr-1" /> Preview
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="w-full flex gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
            <TabsTrigger value="edit">Editor</TabsTrigger>
            <TabsTrigger value="diff" onClick={() => setShowDiff(true)}>Diff (simple)</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-3">
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="grid gap-2 p-4 md:border-r md:border-border/60">
                  <Label htmlFor="src">Source</Label>
                  <Textarea
                    id="src"
                    className={cx('font-mono resize-none bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl', PANEL_H)}
                    value={source}
                    onChange={(e) => onChangeSource(e.target.value)}
                    placeholder={`// Paste your code here`}
                    spellCheck={false}
                  />
                </div>
                <div className="grid gap-2 p-4">
                  <Label htmlFor="out">Formatted</Label>
                  <Textarea
                    id="out"
                    className={cx('font-mono resize-none bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl', PANEL_H)}
                    value={formatted}
                    readOnly
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="diff" className="mt-3">
            <div className={cx('rounded-2xl border border-border/60 bg-card overflow-hidden', PANEL_H)}>
              <div className="grid grid-cols-2 text-xs font-mono h-full">
                <div className="border-r border-border/60 overflow-auto p-2">
                  {diffLines.map((r, i) => (
                    <div
                      key={i}
                      className={cx(
                        'whitespace-pre',
                        r.s === 'del'
                          ? 'bg-destructive/10 text-destructive'
                          : r.s === 'mod'
                          ? 'bg-warning/10 text-foreground'
                          : ''
                      )}
                    >
                      {r.left ?? ''}
                    </div>
                  ))}
                </div>
                <div className="overflow-auto p-2">
                  {diffLines.map((r, i) => (
                    <div
                      key={i}
                      className={cx(
                        'whitespace-pre',
                        r.s === 'add'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-300'
                          : r.s === 'mod'
                          ? 'bg-warning/10 text-foreground'
                          : ''
                      )}
                    >
                      {r.right ?? ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {err && (
          <div className="rounded-xl border border-rose-200/60 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
            {err} — Pastikan paket <code>prettier</code> & plugin parsers terpasang.
          </div>
        )}
        <Separator />
        <div className="text-xs text-muted-foreground">Shortcut: ⌘/Ctrl+Enter untuk Format. Auto-format bisa dimatikan jika source besar.</div>
      </div>

      <CarbonPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        code={formatted || source}
        language={parser}
        filename={filename}
      />
    </>
  )
}
