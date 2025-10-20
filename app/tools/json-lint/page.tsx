'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  FileJson,
  Play,
  Copy,
  Check,
  Scissors,
  Download,
  Upload,
  Code2,
  ListTree,
  BarChart4,
  Sparkles,        // ✅ pakai dari lucide-react saja
} from 'lucide-react'
import { Icon } from 'lucide-react';
import { broom } from '@lucide/lab';

// ===== util =====
function deepSortKeys(input: any): any {
  if (Array.isArray(input)) return input.map(deepSortKeys)
  if (input && typeof input === 'object') {
    const out: Record<string, any> = {}
    Object.keys(input).sort().forEach(k => (out[k] = deepSortKeys(input[k])))
    return out
  }
  return input
}

type Stats = {
  bytes: number; depth: number; keys: number; arrays: number; objects: number;
  strings: number; numbers: number; booleans: number; nulls: number
}

function computeStats(v: any): Stats {
  const s: Stats = { bytes:0, depth:0, keys:0, arrays:0, objects:0, strings:0, numbers:0, booleans:0, nulls:0 }
  function walk(x:any, d:number){
    s.depth = Math.max(s.depth, d)
    if (x === null) s.nulls++
    else if (Array.isArray(x)){ s.arrays++; x.forEach(i=>walk(i,d+1)) }
    else if (typeof x === 'object'){ s.objects++; s.keys += Object.keys(x).length; Object.values(x).forEach(i=>walk(i,d+1)) }
    else if (typeof x === 'string') s.strings++
    else if (typeof x === 'number') s.numbers++
    else if (typeof x === 'boolean') s.booleans++
  }
  walk(v,1); return s
}

function bytesOf(t:string){ return (typeof window!=='undefined' && 'TextEncoder' in window) ? new TextEncoder().encode(t).length : t.length }
function downloadText(filename:string, text:string){
  const blob = new Blob([text], { type:'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob); const a = document.createElement('a')
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
}
function cx(...xs: Array<string | false | null | undefined>){ return xs.filter(Boolean).join(' ') }

// ===== tree viewer =====
function JsonNode({ name, value }: { name?: string; value: any }) {
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
  if (type === 'object') {
    const keys = Object.keys(value)
    return (
      <details open className="group">
        <summary className="cursor-pointer select-none text-slate-800 rounded px-1 py-0.5 hover:bg-slate-100">
          <span className="font-medium">{name ?? 'object'}</span>{' '}
          <span className="text-slate-500">{' {'}{keys.length} keys{'} '}</span>
        </summary>
        <ul className="ml-3 sm:ml-4 border-l border-slate-200 pl-2 sm:pl-3 space-y-1">
          {keys.map((k) => (<li key={k}><JsonNode name={k} value={value[k]} /></li>))}
        </ul>
      </details>
    )
  }
  if (type === 'array') {
    return (
      <details open className="group">
        <summary className="cursor-pointer select-none text-slate-800 rounded px-1 py-0.5 hover:bg-slate-100">
          <span className="font-medium">{name ?? 'array'}</span>{' '}
          <span className="text-slate-500">[ {value.length} items ]</span>
        </summary>
        <ul className="ml-3 sm:ml-4 border-l border-slate-200 pl-2 sm:pl-3 space-y-1">
          {value.map((v: any, i: number) => (<li key={i}><JsonNode name={String(i)} value={v} /></li>))}
        </ul>
      </details>
    )
  }
  const label = type === 'string' ? `"${value}"` : String(value)
  const color =
    type === 'string' ? 'text-emerald-700'
    : type === 'number' ? 'text-blue-700'
    : type === 'boolean' ? 'text-purple-700'
    : type === 'null' ? 'text-slate-500'
    : 'text-slate-800'
  return (
    <div className="px-1">
      {name !== undefined && <span className="text-slate-600">{name}: </span>}
      <span className={cx('font-mono break-all', color)}>{label}</span>
      <span className="ml-2 text-[11px] text-slate-400">({type})</span>
    </div>
  )
}

export default function JsonLintPage() {
  return (
    <section className="grid gap-6">
      <div className="flex items-center gap-2">
        <FileJson className="h-5 w-5" />
        <h1 className="text-xl font-semibold">JSON Lint</h1>
      </div>
      <Card className="border border-slate-200/80 rounded-2xl shadow-sm">
        <CardContent>
          <JsonLintTool />
        </CardContent>
      </Card>
    </section>
  )
}

function JsonLintTool() {
  // —— Fixed, responsive panel height (dipakai semua view di kanan & kiri)
  const PANEL_H = 'h-[200px] sm:h-[260px] md:h-[300px]'

  const [input, setInput] = React.useState<string>('{\n  "hello": "world",\n  "items": [1,2,3],\n  "ok": true\n}')
  const [output, setOutput] = React.useState<string>('')
  const [error, setError] = React.useState<string>('')

  const [isValid, setIsValid] = React.useState<boolean>(true)
  const [autoLint, setAutoLint] = React.useState<boolean>(true)
  const [sortKeys, setSortKeys] = React.useState<boolean>(false)
  const [indent, setIndent] = React.useState<number>(2)

  const fileRef = React.useRef<HTMLInputElement>(null)
  const [copiedOut, setCopiedOut] = React.useState(false)
  const [copiedIn, setCopiedIn] = React.useState(false)

  const tryParse = React.useCallback(() => {
    try { const obj = JSON.parse(input); setIsValid(true); setError(''); return obj }
    catch (e:any){ setIsValid(false); setError(e?.message || String(e)); return undefined }
  }, [input])

  const lint = React.useCallback(() => {
    const obj = tryParse(); if (obj === undefined){ setOutput(''); return }
    const maybeSorted = sortKeys ? deepSortKeys(obj) : obj
    setOutput(JSON.stringify(maybeSorted, null, indent)); setIsValid(true); setError('')
  }, [tryParse, sortKeys, indent])

  const minify = React.useCallback(() => {
    const obj = tryParse(); if (obj === undefined){ setOutput(''); return }
    const maybeSorted = sortKeys ? deepSortKeys(obj) : obj
    setOutput(JSON.stringify(maybeSorted)); setIsValid(true); setError('')
  }, [tryParse, sortKeys])

  React.useEffect(() => {
    if (!autoLint) return
    const t = setTimeout(() => lint(), 250)
    return () => clearTimeout(t)
  }, [input, autoLint, lint])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return
      if (e.key === 'Enter'){ e.preventDefault(); lint() }
      else if (e.key.toLowerCase() === 'm'){ e.preventDefault(); minify() }
      else if (e.key.toLowerCase() === 's'){ e.preventDefault(); if (output) downloadText('output.json', output) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lint, minify, output])

  const copyOut = async () => { if (!output) return; await navigator.clipboard.writeText(output); setCopiedOut(true); setTimeout(()=>setCopiedOut(false), 900) }
  const copyIn  = async () => { if (!input)  return; await navigator.clipboard.writeText(input);  setCopiedIn(true);  setTimeout(()=>setCopiedIn(false),  900) }
  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; setInput(await f.text()) }
  const loadSample = () => {
    const sample = { name: 'Raznar Tools', version: 1, features: ['lint','minify','sortKeys','tree','stats'], meta: { author: 'Fakhri', active: true, tags: null } }
    setInput(JSON.stringify(sample, null, indent))
  }

  const parsed = React.useMemo(() => { try { return JSON.parse(output || input) } catch { return null } }, [output, input])
  const stats  = React.useMemo<Stats | null>(() => {
    if (!parsed) return null
    const s = computeStats(parsed); s.bytes = bytesOf(output || input); return s
  }, [parsed, output, input])

  return (
    <div className="grid gap-4">
      
      {/* ===== Top toolbar ===== */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cx('px-2 py-0.5 border', isValid ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700')}
            title={isValid ? 'JSON is valid' : 'JSON is invalid'}
          >
            {isValid ? 'Valid JSON' : 'Invalid JSON'}
          </Badge>
          {stats && (
            <span className="text-xs text-slate-500">
              {stats.bytes.toLocaleString()} bytes · depth {stats.depth} · keys {stats.keys}
            </span>
          )}
        </div>

        {/* Desktop options */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="autolint" className="text-xs text-slate-600">Auto-lint</Label>
            <Switch id="autolint" checked={autoLint} onCheckedChange={setAutoLint} />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="sortkeys" className="text-xs text-slate-600">Sort keys</Label>
            <Switch id="sortkeys" checked={sortKeys} onCheckedChange={setSortKeys} />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="indent" className="text-xs text-slate-600">Indent</Label>
            <select
              id="indent"
              title="Indent"
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </div>
        </div>

        {/* Mobile options */}
        <details className="sm:hidden rounded-md border border-slate-200 bg-white">
          <summary className="list-none cursor-pointer px-3 py-2 text-sm flex items-center justify-between">
            <span>Options</span>
            <span className="text-slate-400">▾</span>
          </summary>
          <div className="px-3 pb-3 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="autolint_m" className="text-xs text-slate-600">Auto-lint</Label>
              <Switch id="autolint_m" checked={autoLint} onCheckedChange={setAutoLint} />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="sortkeys_m" className="text-xs text-slate-600">Sort keys</Label>
              <Switch id="sortkeys_m" checked={sortKeys} onCheckedChange={setSortKeys} />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="indent_m" className="text-xs text-slate-600">Indent</Label>
              <select
                id="indent_m"
                title="Indent"
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm"
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>
        </details>
      </div>

      {/* ===== Main grid ===== */}
      <div className="grid gap-4 md:grid-cols-2 items-start">
        {/* Left: Input */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="json-in">JSON Input</Label>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="outline" onClick={copyIn} title="Copy input">
                {copiedIn ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <input
                title="file upload"
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={onUpload}
              />
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} title="Import JSON file">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Import</span>
              </Button>
              <Button size="sm" variant="outline" onClick={loadSample} title="Load sample JSON">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Sample</span>
              </Button>
              <Button size="sm" variant="outline" onClick={() => setInput('')} title="Clear input">
                <Icon className="h-4 w-4" iconNode={broom} />
                <span className="hidden sm:inline ml-1">Clear</span>
              </Button>
            </div>
          </div>

          {/* ✅ Tinggi tetap, isi penuh */}
          <div className="flex-1">
            <Textarea
              id="json-in"
                    className={cx('font-mono resize-none', PANEL_H)}

              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: Output */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="json-out">Output</Label>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="outline" onClick={copyOut} title="Copy output">
                {copiedOut ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={() => output && downloadText('output.json', output)} title="Download output">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Download</span>
              </Button>
              <Button size="sm" onClick={minify} title="Minify (⌘/Ctrl+M)">
                <Scissors className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Minify</span>
              </Button>
              <Button size="sm" onClick={lint} title="Lint (⌘/Ctrl+Enter)">
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Lint</span>
              </Button>
            </div>
          </div>

          {/* ✅ Tabs di kanan juga fix height biar sejajar kiri */}
          <Tabs defaultValue="text" className="flex-1 flex flex-col h-[300px] sm:h-[360px] md:h-[400px]">
            <TabsList className="flex gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
              <TabsTrigger value="text"  className="flex items-center gap-2 flex-shrink-0"><FileJson  className="h-4 w-4" /> <span className="hidden xs:inline">Text</span></TabsTrigger>
              <TabsTrigger value="tree"  className="flex items-center gap-2 flex-shrink-0"><ListTree className="h-4 w-4" /> <span className="hidden xs:inline">Tree</span></TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2 flex-shrink-0"><BarChart4 className="h-4 w-4" /> <span className="hidden xs:inline">Stats</span></TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-2 h-full">
              <Textarea id="json-out" className="font-mono resize-none h-full" value={output} readOnly spellCheck={false} />
            </TabsContent>

            <TabsContent value="tree" className="mt-2 h-full">
              <div className="rounded-md border border-slate-200 bg-white p-3 h-full overflow-auto">
                {parsed ? <JsonNode value={parsed} /> : <div className="text-sm text-slate-500">Tidak ada data untuk ditampilkan.</div>}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-2 h-full">
              <div className="rounded-md border border-slate-200 bg-white p-3 text-sm h-full overflow-auto grid grid-cols-1 gap-0.5">
                {stats ? (
                        <>
                          <div><span className="text-slate-500">Bytes:</span>    <span className="font-medium">{stats.bytes.toLocaleString()}</span></div>
                          <div><span className="text-slate-500">Depth:</span>    <span className="font-medium">{stats.depth}</span></div>
                          <div><span className="text-slate-500">Keys:</span>     <span className="font-medium">{stats.keys}</span></div>
                          <div><span className="text-slate-500">Arrays:</span>   <span className="font-medium">{stats.arrays}</span></div>
                          <div><span className="text-slate-500">Objects:</span>  <span className="font-medium">{stats.objects}</span></div>
                          <div><span className="text-slate-500">Strings:</span>  <span className="font-medium">{stats.strings}</span></div>
                          <div><span className="text-slate-500">Numbers:</span>  <span className="font-medium">{stats.numbers}</span></div>
                          <div><span className="text-slate-500">Booleans:</span> <span className="font-medium">{stats.booleans}</span></div>
                          <div><span className="text-slate-500">Nulls:</span>    <span className="font-medium">{stats.nulls}</span></div>
                        </>
                      ) : (
                        <div className="text-slate-500">Tidak ada statistik yang bisa dihitung.</div>
                      )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Error Panel */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="status" aria-live="polite">
          <span className="font-medium">Parse error:</span> {error}
        </div>
      )}

      <Separator />
      <div className="text-xs text-slate-500">
        Tip: ⌘/Ctrl+Enter untuk Pretty/Lint, ⌘/Ctrl+M untuk Minify, ⌘/Ctrl+S untuk Download. Matikan Auto-lint untuk file besar.
      </div>
    </div>
  )
}
