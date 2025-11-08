'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  ListTree,
  BarChart4,
  Sparkles,
} from 'lucide-react'
import { Icon } from 'lucide-react'
import { broom } from '@lucide/lab'

/* ================= util ================= */
function deepSortKeys(input: any): any {
  if (Array.isArray(input)) return input.map(deepSortKeys)
  if (input && typeof input === 'object') {
    const out: Record<string, any> = {}
    Object.keys(input)
      .sort()
      .forEach((k) => (out[k] = deepSortKeys(input[k])))
    return out
  }
  return input
}

type Stats = {
  bytes: number
  depth: number
  keys: number
  arrays: number
  objects: number
  strings: number
  numbers: number
  booleans: number
  nulls: number
}

function computeStats(v: any): Stats {
  const s: Stats = {
    bytes: 0,
    depth: 0,
    keys: 0,
    arrays: 0,
    objects: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
  }
  function walk(x: any, d: number) {
    s.depth = Math.max(s.depth, d)
    if (x === null) s.nulls++
    else if (Array.isArray(x)) {
      s.arrays++
      x.forEach((i) => walk(i, d + 1))
    } else if (typeof x === 'object') {
      s.objects++
      s.keys += Object.keys(x).length
      Object.values(x).forEach((i) => walk(i, d + 1))
    } else if (typeof x === 'string') s.strings++
    else if (typeof x === 'number') s.numbers++
    else if (typeof x === 'boolean') s.booleans++
  }
  walk(v, 1)
  return s
}

function bytesOf(t: string) {
  return typeof window !== 'undefined' && 'TextEncoder' in window
    ? new TextEncoder().encode(t).length
    : t.length
}
function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

/* =============== tree viewer =============== */
function JsonNode({ name, value }: { name?: string; value: any }) {
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value

  if (type === 'object') {
    const keys = Object.keys(value)
    return (
      <details open className="group">
        <summary className="cursor-pointer select-none rounded px-1 py-0.5 hover:bg-muted text-foreground">
          <span className="font-medium">{name ?? 'object'}</span>{' '}
          <span className="text-muted-foreground">{' {'}{keys.length} keys{'} '}</span>
        </summary>
        <ul className="ml-3 sm:ml-4 border-l border-border pl-2 sm:pl-3 space-y-1">
          {keys.map((k) => (
            <li key={k}>
              <JsonNode name={k} value={value[k]} />
            </li>
          ))}
        </ul>
      </details>
    )
  }

  if (type === 'array') {
    return (
      <details open className="group">
        <summary className="cursor-pointer select-none rounded px-1 py-0.5 hover:bg-muted text-foreground">
          <span className="font-medium">{name ?? 'array'}</span>{' '}
          <span className="text-muted-foreground">[ {value.length} items ]</span>
        </summary>
        <ul className="ml-3 sm:ml-4 border-l border-border pl-2 sm:pl-3 space-y-1">
          {value.map((v: any, i: number) => (
            <li key={i}>
              <JsonNode name={String(i)} value={v} />
            </li>
          ))}
        </ul>
      </details>
    )
  }

  const label = type === 'string' ? `"${value}"` : String(value)
  const color =
    type === 'string'
      ? 'text-emerald-700 dark:text-emerald-400'
      : type === 'number'
      ? 'text-blue-700 dark:text-blue-400'
      : type === 'boolean'
      ? 'text-purple-700 dark:text-purple-400'
      : type === 'null'
      ? 'text-muted-foreground'
      : 'text-foreground'

  return (
    <div className="px-1">
      {name !== undefined && <span className="text-muted-foreground">{name}: </span>}
      <span className={cx('font-mono break-all', color)}>{label}</span>
      <span className="ml-2 text-[11px] text-muted-foreground">({type})</span>
    </div>
  )
}

/* =============== page =============== */
export default function JsonLintPage() {
  return (
    <section className="grid gap-6">
      <div className="flex items-center gap-2">
        <FileJson className="h-5 w-5" />
        <h1 className="text-xl font-semibold text-foreground">JSON Lint</h1>
      </div>

      <Card className="border border-border rounded-2xl shadow-sm bg-card text-card-foreground">
        <CardContent>
          <JsonLintTool />
        </CardContent>
      </Card>
    </section>
  )
}

/* =============== tool =============== */
function JsonLintTool() {
  const PANEL_H = 'h-[200px] sm:h-[260px] md:h-[300px]'

  const [input, setInput] = React.useState<string>(
    '{\n  "hello": "world",\n  "items": [1,2,3],\n  "ok": true\n}',
  )
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
    try {
      const obj = JSON.parse(input)
      setIsValid(true)
      setError('')
      return obj
    } catch (e: any) {
      setIsValid(false)
      setError(e?.message || String(e))
      return undefined
    }
  }, [input])

  const lint = React.useCallback(() => {
    const obj = tryParse()
    if (obj === undefined) {
      setOutput('')
      return
    }
    const maybeSorted = sortKeys ? deepSortKeys(obj) : obj
    setOutput(JSON.stringify(maybeSorted, null, indent))
    setIsValid(true)
    setError('')
  }, [tryParse, sortKeys, indent])

  const minify = React.useCallback(() => {
    const obj = tryParse()
    if (obj === undefined) {
      setOutput('')
      return
    }
    const maybeSorted = sortKeys ? deepSortKeys(obj) : obj
    setOutput(JSON.stringify(maybeSorted))
    setIsValid(true)
    setError('')
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
      if (e.key === 'Enter') {
        e.preventDefault()
        lint()
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault()
        minify()
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (output) downloadText('output.json', output)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lint, minify, output])

  const copyOut = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopiedOut(true)
    setTimeout(() => setCopiedOut(false), 900)
  }
  const copyIn = async () => {
    if (!input) return
    await navigator.clipboard.writeText(input)
    setCopiedIn(true)
    setTimeout(() => setCopiedIn(false), 900)
  }
  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setInput(await f.text())
  }
  const loadSample = () => {
    const sample = {
      name: 'Raznar Tools',
      version: 1,
      features: ['lint', 'minify', 'sortKeys', 'tree', 'stats'],
      meta: { author: 'Fakhri', active: true, tags: null },
    }
    setInput(JSON.stringify(sample, null, indent))
  }

  const parsed = React.useMemo(() => {
    try {
      return JSON.parse(output || input)
    } catch {
      return null
    }
  }, [output, input])

  const stats = React.useMemo<Stats | null>(() => {
    if (!parsed) return null
    const s = computeStats(parsed)
    s.bytes = bytesOf(output || input)
    return s
  }, [parsed, output, input])

  return (
    <div className="grid gap-4">
      {/* ===== Top toolbar ===== */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cx(
              'px-2 py-0.5 border',
              isValid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900'
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900',
            )}
            title={isValid ? 'JSON is valid' : 'JSON is invalid'}
          >
            {isValid ? 'Valid JSON' : 'Invalid JSON'}
          </Badge>
          {stats && (
            <span className="text-xs text-muted-foreground">
              {stats.bytes.toLocaleString()} bytes · depth {stats.depth} · keys {stats.keys}
            </span>
          )}
        </div>

        {/* Desktop options */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="autolint" className="text-xs text-muted-foreground">
              Auto-lint
            </Label>
            <Switch id="autolint" checked={autoLint} onCheckedChange={setAutoLint} />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="sortkeys" className="text-xs text-muted-foreground">
              Sort keys
            </Label>
            <Switch id="sortkeys" checked={sortKeys} onCheckedChange={setSortKeys} />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="indent" className="text-xs text-muted-foreground">
              Indent
            </Label>
            <select
              id="indent"
              title="Indent"
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="h-8 rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </div>
        </div>

        {/* Mobile options */}
        <details className="sm:hidden rounded-md border border-border bg-card text-card-foreground">
          <summary className="list-none cursor-pointer px-3 py-2 text-sm flex items-center justify-between">
            <span>Options</span>
            <span className="text-muted-foreground">▾</span>
          </summary>
          <div className="px-3 pb-3 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="autolint_m" className="text-xs text-muted-foreground">
                Auto-lint
              </Label>
              <Switch id="autolint_m" checked={autoLint} onCheckedChange={setAutoLint} />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="sortkeys_m" className="text-xs text-muted-foreground">
                Sort keys
              </Label>
              <Switch id="sortkeys_m" checked={sortKeys} onCheckedChange={setSortKeys} />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="indent_m" className="text-xs text-muted-foreground">
                Indent
              </Label>
              <select
                id="indent_m"
                title="Indent"
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="h-8 rounded-md border border-border bg-background px-2 text-sm"
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
            <Label htmlFor="json-in" className="text-foreground">
              JSON Input
            </Label>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="outline" onClick={copyIn} title="Copy input" className="border-border">
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                title="Import JSON file"
                className="border-border"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Import</span>
              </Button>
              <Button size="sm" variant="outline" onClick={loadSample} title="Load sample JSON" className="border-border">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Sample</span>
              </Button>
              <Button size="sm" variant="outline" onClick={() => setInput('')} title="Clear input" className="border-border">
                <Icon className="h-4 w-4" iconNode={broom} />
                <span className="hidden sm:inline ml-1">Clear</span>
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <Textarea
              id="json-in"
              className={cx('font-mono resize-none bg-background', PANEL_H)}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: Output */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="json-out" className="text-foreground">
              Output
            </Label>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="outline" onClick={copyOut} title="Copy output" className="border-border">
                {copiedOut ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => output && downloadText('output.json', output)}
                title="Download output"
                className="border-border"
              >
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

          <Tabs defaultValue="text" className="flex-1 flex flex-col h-[300px] sm:h-[360px] md:h-[400px]">
            <TabsList className="flex gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
              <TabsTrigger value="text" className="flex items-center gap-2 flex-shrink-0">
                <FileJson className="h-4 w-4" /> <span className="hidden xs:inline">Text</span>
              </TabsTrigger>
              <TabsTrigger value="tree" className="flex items-center gap-2 flex-shrink-0">
                <ListTree className="h-4 w-4" /> <span className="hidden xs:inline">Tree</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2 flex-shrink-0">
                <BarChart4 className="h-4 w-4" /> <span className="hidden xs:inline">Stats</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-2 h-full">
              <Textarea
                id="json-out"
                className="font-mono resize-none h-full bg-background"
                value={output}
                readOnly
                spellCheck={false}
              />
            </TabsContent>

            <TabsContent value="tree" className="mt-2 h-full">
              <div className="rounded-md border border-border bg-card p-3 h-full overflow-auto">
                {parsed ? (
                  <JsonNode value={parsed} />
                ) : (
                  <div className="text-sm text-muted-foreground">Tidak ada data untuk ditampilkan.</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-2 h-full">
              <div className="rounded-md border border-border bg-card p-3 text-sm h-full overflow-auto grid grid-cols-1 gap-0.5">
                {stats ? (
                  <>
                    <div>
                      <span className="text-muted-foreground">Bytes:</span>{' '}
                      <span className="font-medium">{stats.bytes.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Depth:</span>{' '}
                      <span className="font-medium">{stats.depth}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Keys:</span>{' '}
                      <span className="font-medium">{stats.keys}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Arrays:</span>{' '}
                      <span className="font-medium">{stats.arrays}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Objects:</span>{' '}
                      <span className="font-medium">{stats.objects}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Strings:</span>{' '}
                      <span className="font-medium">{stats.strings}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Numbers:</span>{' '}
                      <span className="font-medium">{stats.numbers}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Booleans:</span>{' '}
                      <span className="font-medium">{stats.booleans}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nulls:</span>{' '}
                      <span className="font-medium">{stats.nulls}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">Tidak ada statistik yang bisa dihitung.</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Error Panel */}
      {error && (
        <div
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="status"
          aria-live="polite"
        >
          <span className="font-medium">Parse error:</span> {error}
        </div>
      )}

      <Separator />
      <div className="text-xs text-muted-foreground">
        Tip: ⌘/Ctrl+Enter untuk Pretty/Lint, ⌘/Ctrl+M untuk Minify, ⌘/Ctrl+S untuk Download. Matikan Auto-lint untuk
        file besar.
      </div>
    </div>
  )
}
