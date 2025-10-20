'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, FileJson, Copy, Wand2 } from 'lucide-react'

type ParseOptions = {
  delimiter: string
  quote: string
}

// --- Utility: strip BOM ---
function stripBOM(s: string) {
  return s.replace(/^\uFEFF/, '')
}

// --- Auto-detect delimiter from first few lines (ignoring quoted fields) ---
function detectDelimiter(text: string, quote: string): string {
  const sample = stripBOM(text).split(/\r?\n/).slice(0, 10).join('\n')
  const candidates = [',', ';', '\t', '|'] as const
  const score: Record<string, number> = { ',': 0, ';': 0, '\t': 0, '|': 0 }

  let inQuotes = false
  for (let i = 0; i < sample.length; i++) {
    const ch = sample[i]
    const next = sample[i + 1]
    if (inQuotes) {
      if (ch === quote) {
        if (next === quote) {
          i++ // escaped
        } else {
          inQuotes = false
        }
      }
      continue
    }
    if (ch === quote) {
      inQuotes = true
      continue
    }
    for (const c of candidates) if (ch === c) score[c]++
  }

  let best = ','
  let bestVal = -1
  for (const c of candidates) if (score[c] > bestVal) { best = c; bestVal = score[c] }
  return best
}

function parseCSV(text: string, opts: ParseOptions): string[][] {
  const { delimiter, quote } = opts
  const rows: string[][] = []
  let cur: string[] = []
  let field = ''
  let inQuotes = false

  const pushField = () => { cur.push(field); field = '' }
  const pushRow = () => { rows.push(cur); cur = [] }

  const s = stripBOM(text)

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    const next = s[i + 1]

    if (inQuotes) {
      if (ch === quote) {
        if (next === quote) { field += quote; i++ } else { inQuotes = false }
      } else {
        field += ch
      }
      continue
    }

    if (ch === quote) { inQuotes = true; continue }
    if (ch === delimiter) { pushField(); continue }

    if (ch === '\n') { pushField(); pushRow(); continue }

    if (ch === '\r') {
      if (next === '\n') { pushField(); pushRow(); i++ } else { pushField(); pushRow() }
      continue
    }

    field += ch
  }

  pushField(); pushRow()

  if (rows.length === 1 && rows[0].length === 1 && rows[0][0] === '') return []
  if (rows.length && rows[rows.length - 1].every((c) => c === '')) rows.pop()

  return rows
}

function toJSON(rows: string[][], hasHeader: boolean, normalizeKeys: boolean) {
  if (rows.length === 0) return []

  const norm = (k: string, fb: string) => {
    if (!normalizeKeys) return (k && k.length ? k : fb)
    const s = (k || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
    return s || fb
  }

  if (hasHeader) {
    const header = rows[0]
    return rows.slice(1).map((r) => {
      const obj: Record<string, string> = {}
      const max = Math.max(header.length, r.length)
      for (let i = 0; i < max; i++) {
        const rawKey = header[i] ?? `col_${i + 1}`
        const key = norm(rawKey, `col_${i + 1}`)
        obj[key] = r[i] ?? ''
      }
      return obj
    })
  } else {
    const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0)
    return rows.map((r) => {
      const obj: Record<string, string> = {}
      for (let i = 0; i < maxCols; i++) obj[`col_${i + 1}`] = r[i] ?? ''
      return obj
    })
  }
}

export default function CsvToJsonPage() {
  // contoh default kecil
  const [csv, setCsv] = React.useState<string>('name,age\nAlice,30\nBob,28')

  // --- Controls (perbaikan delimiter manual) ---
  const [autoDetect, setAutoDetect] = React.useState<boolean>(true)
  const [delimiter, setDelimiter] = React.useState<string>(',')
  const [quote, setQuote] = React.useState<string>('"')
  const [hasHeader, setHasHeader] = React.useState<boolean>(true)
  const [trimCells, setTrimCells] = React.useState<boolean>(true)
  const [normalizeKeys, setNormalizeKeys] = React.useState<boolean>(false)

  const effDelimiter = React.useMemo(
    () => (autoDetect ? detectDelimiter(csv, quote) : (delimiter || ',')),
    [autoDetect, csv, quote, delimiter]
  )

  const rawRows = React.useMemo(
    () => parseCSV(csv, { delimiter: effDelimiter, quote }),
    [csv, effDelimiter, quote]
  )

  const rows = React.useMemo(
    () => (trimCells ? rawRows.map(r => r.map(c => c.trim())) : rawRows),
    [rawRows, trimCells]
  )

  const json = React.useMemo(
    () => toJSON(rows, hasHeader, normalizeKeys),
    [rows, hasHeader, normalizeKeys]
  )

  const onFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => setCsv(String(reader.result ?? ''))
    reader.readAsText(file)
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(json, null, 2))
  }

  // --- Helpers untuk kontrol delimiter ---
  const setManualDelimiter = (val: string) => {
    setAutoDetect(false)
    setDelimiter(val)
  }

  const handleDelimiterChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    // ambil hanya 1 karakter pertama; dukung token \t
    const raw = e.target.value
    const v = raw.startsWith('\\t') ? '\t' : raw.slice(0, 1)
    setManualDelimiter(v || ',')
  }

  const handleDelimiterKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    // tekan tombol Tab → set delimiter ke TAB, cegah pindah fokus
    if (e.key === 'Tab') {
      e.preventDefault()
      setManualDelimiter('\t')
    }
  }

  const loadSemicolonSample = () => {
    setCsv(
`Username; Identifier;One-time password;Recovery code;First name;Last name;Department;Location
booker12;9012;12se74;rb9012;Rachel;Booker;Sales;Manchester
grey07;2070;04ap67;lg2070;Laura;Grey;Depot;London
johnson81;4081;30no86;cj4081;Craig;Johnson;Depot;London
jenkins46;9346;14ju73;mj9346;Mary;Jenkins;Engineering;Manchester
smith79;5079;09ja61;js5079;Jamie;Smith;Engineering;Manchester`
    )
    setAutoDetect(true)
    setHasHeader(true)
    setTrimCells(true)
  }

  return (
    <section className="grid gap-6">
      <div className="flex items-center gap-2">
        <FileJson className="h-5 w-5" />
        <h1 className="text-xl font-semibold">CSV → JSON Converter</h1>
        <Badge variant="outline">Patched</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="grid gap-2">
              <Label className="inline-flex items-center gap-2">
                <input
                  title='Auto Detect Delimiter'
                  type="checkbox"
                  className="h-4 w-4"
                  checked={autoDetect}
                  onChange={(e) => setAutoDetect(e.target.checked)}
                />
                Auto-detect delimiter
              </Label>

              {/* Manual delimiter controls */}
              <div className="flex items-end gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="delimiter">Delimiter (manual)</Label>
                  <Input
                    id="delimiter"
                    type="text"
                    inputMode="text"
                    value={delimiter}
                    onChange={handleDelimiterChange}
                    onKeyDown={handleDelimiterKeyDown}
                    className="w-24"
                    disabled={autoDetect}
                    placeholder=", ; | TAB"
                  />
                  <div className="text-xs text-muted-foreground">
                    {autoDetect
                      ? <>Dipakai (auto): <b>{effDelimiter === '\t' ? 'TAB' : effDelimiter}</b></>
                      : <>Manual: ketik 1 karakter, <code>\t</code> untuk TAB</>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setManualDelimiter(',')}
                    disabled={autoDetect}
                    title="Comma"
                  >,</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setManualDelimiter(';')}
                    disabled={autoDetect}
                    title="Semicolon"
                  >;</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setManualDelimiter('\t')}
                    disabled={autoDetect}
                    title="Tab"
                  >TAB</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setManualDelimiter('|')}
                    disabled={autoDetect}
                    title="Pipe"
                  >|</Button>
                </div>
              </div>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="quote">Quote</Label>
              <Input
                id="quote"
                type="text"
                inputMode="text"
                value={quote}
                maxLength={1}
                onChange={(e) => setQuote(e.target.value || '"')}
                className="w-24"
              />
            </div>

            <div className="grid gap-1">
              <Label className="inline-flex items-center gap-2">
                <input title="Header" type="checkbox" className="h-4 w-4" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} />
                Header di baris pertama
              </Label>
              <Label className="inline-flex items-center gap-2">
                <input title="Trim" type="checkbox" className="h-4 w-4" checked={trimCells} onChange={(e) => setTrimCells(e.target.checked)} />
                Trim spasi tiap sel
              </Label>
              <Label className="inline-flex items-center gap-2">
                <input title="Normalize Keys" type="checkbox" className="h-4 w-4" checked={normalizeKeys} onChange={(e) => setNormalizeKeys(e.target.checked)} />
                Normalize keys (snake_case)
              </Label>
            </div>

            <div className="ml-auto flex gap-2">
              <Input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} className="w-56" />
              <Button variant="secondary" onClick={() => setCsv('')}>
                <Upload className="mr-2 h-4 w-4" /> Clear
              </Button>
              <Button variant="outline" onClick={loadSemicolonSample}>
                <Wand2 className="mr-2 h-4 w-4" /> Load contoh (;)
              </Button>
            </div>
          </div>

          <Label htmlFor="csv">CSV</Label>
          <Textarea id="csv" rows={10} value={csv} onChange={(e) => setCsv(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Hasil JSON</CardTitle>
          <div className="flex gap-2">
            <Button onClick={copyJSON}><Copy className="mr-2 h-4 w-4" /> Copy</Button>
            <Button variant="outline" onClick={downloadJSON}><Download className="mr-2 h-4 w-4" /> Download</Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="rounded border p-3 text-xs">{JSON.stringify(json, null, 2)}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          <div>Mode: <b>{autoDetect ? 'Auto' : 'Manual'}</b></div>
          <div>Effective delimiter: <b>{effDelimiter === '\t' ? 'TAB' : effDelimiter}</b></div>
          <div>Rows parsed: <b>{rows.length}</b></div>
          <div>Columns (max): <b>{rows.reduce((m, r) => Math.max(m, r.length), 0)}</b></div>
        </CardContent>
      </Card>
    </section>
  )
}
