'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlarmClock, Wand2, Copy } from 'lucide-react'

const COMMON_TZS = [
  'UTC',
  'Asia/Jakarta',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Bangkok',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
]

// ---------- Cron parse helpers (supports 5/6/7 fields, *, lists, ranges, steps, names) ----------
const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const DOW_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] // 0=Sun

function parseListPart(part: string, min: number, max: number, names?: string[]): Set<number> {
  const out = new Set<number>()
  const norm = (tok: string) => {
    const t = tok.trim().toLowerCase()
    if (!names) return Number(t)
    const idx = names.indexOf(t)
    return idx >= 0 ? (names === MONTH_NAMES ? idx + 1 : idx) : Number(t)
  }

  for (const seg of part.split(',')) {
    if (seg.includes('/')) {
      const [range, stepStr] = seg.split('/')
      const step = Math.max(1, Number(stepStr || '1'))
      if (range === '*') {
        for (let i = min; i <= max; i += step) out.add(i)
      } else if (range.includes('-')) {
        const [a, b] = range.split('-')
        const start = norm(a)
        const end = norm(b)
        for (let i = start; i <= end; i += step) if (i >= min && i <= max) out.add(i)
      } else {
        const base = norm(range)
        for (let i = base; i <= max; i += step) if (i >= min && i <= max) out.add(i)
      }
    } else if (seg === '*') {
      for (let i = min; i <= max; i++) out.add(i)
    } else if (seg.includes('-')) {
      const [a, b] = seg.split('-')
      const start = norm(a)
      const end = norm(b)
      for (let i = start; i <= end; i++) if (i >= min && i <= max) out.add(i)
    } else {
      const v = norm(seg)
      if (!Number.isNaN(v) && v >= min && v <= max) out.add(v)
    }
  }
  return out
}

type Cron = {
  s?: Set<number>
  m: Set<number>
  h: Set<number>
  dom: Set<number>
  mon: Set<number>
  dow: Set<number>
  year?: Set<number>
}

function parseCron(expr: string): Cron | null {
  const parts = expr.trim().split(/\s+/)
  if (parts.length < 5 || parts.length > 7) return null

  let secPart: string | undefined
  let minPart: string
  let hrPart: string
  let domPart: string
  let monPart: string
  let dowPart: string
  let yearPart: string | undefined

  if (parts.length === 5) {
    ;[minPart, hrPart, domPart, monPart, dowPart] = parts
  } else if (parts.length === 6) {
    ;[secPart, minPart, hrPart, domPart, monPart, dowPart] = parts
  } else {
    ;[secPart, minPart, hrPart, domPart, monPart, dowPart, yearPart] = parts
  }

  const s = secPart ? parseListPart(secPart, 0, 59) : undefined
  const m = parseListPart(minPart, 0, 59)
  const h = parseListPart(hrPart, 0, 23)
  const d = parseListPart(domPart, 1, 31)
  const mo = parseListPart(monPart.toLowerCase(), 1, 12, MONTH_NAMES)
  const dw = parseListPart(dowPart.toLowerCase().replace(/7/g, '0'), 0, 6, DOW_NAMES)
  const y = yearPart ? parseListPart(yearPart, 1970, 2099) : undefined

  if (!m.size || !h.size || !d.size || !mo.size || !dw.size) return null
  if (secPart && (!s || !s.size)) return null
  if (yearPart && (!y || !y.size)) return null

  return { s, m, h, dom: d, mon: mo, dow: dw, year: y }
}

function dtParts(dateUTC: Date, tz: string) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    weekday: 'short',
  })
  const parts = fmt.formatToParts(dateUTC)
  const m = (t: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find(p => p.type === t)?.value || '0')
  const wdName = (parts.find(p => p.type === 'weekday')?.value || 'Sun')
    .slice(0, 3)
    .toLowerCase()
  const dow = DOW_NAMES.indexOf(wdName)
  return {
    year: m('year'),
    mon: m('month'),
    dom: m('day'),
    h: m('hour'),
    min: m('minute'),
    sec: m('second'),
    dow,
  }
}

function cronMatch(cron: Cron, dateUTC: Date, tz: string) {
  const p = dtParts(dateUTC, tz)
  if (cron.s && !cron.s.has(p.sec)) return false
  if (cron.year && !cron.year.has(p.year)) return false
  return (
    cron.m.has(p.min) &&
    cron.h.has(p.h) &&
    cron.dom.has(p.dom) &&
    cron.mon.has(p.mon) &&
    cron.dow.has(p.dow)
  )
}

function nextRuns(expr: string, tz: string, startUTC: Date, n = 10) {
  const cron = parseCron(expr)
  if (!cron) return { error: 'Cron tidak valid', list: [] as Date[] }

  const out: Date[] = []
  const hasSeconds = !!cron.s
  const stepMs = hasSeconds ? 1000 : 60_000
  const cursor = new Date(startUTC.getTime() + stepMs)
  let guard = 0

  while (out.length < n && guard < 500000) {
    if (cronMatch(cron, cursor, tz)) out.push(new Date(cursor))
    cursor.setTime(cursor.getTime() + stepMs)
    guard++
  }

  if (!out.length && guard >= 500000) {
    return { error: 'Pencarian terlalu lama (cek ekspresi)', list: [] }
  }
  return { error: null, list: out }
}

function fmtLong(dateUTC: Date, tz: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour12: false,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'shortOffset',
  }).format(dateUTC)
}

function isValidTZ(tz: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

export default function CronBuilderPage() {
  const [expr, setExpr] = React.useState<string>('*/5 * * * *')
  const [tz, setTz] = React.useState<string>('Asia/Jakarta')
  const [count, setCount] = React.useState<number>(10)

  // Freeze "now" so server & client pakai timestamp yang sama → no hydration mismatch
  const [baseNow] = React.useState(() => Date.now())

  const tzValid = React.useMemo(() => isValidTZ(tz), [tz])
  const tzSafe = tzValid ? tz : 'UTC'

  const { error, list } = React.useMemo(
    () => nextRuns(expr, tzSafe, new Date(baseNow), count),
    [expr, tzSafe, count, baseNow],
  )

  const fieldCount = React.useMemo(
    () => expr.trim().split(/\s+/).filter(Boolean).length,
    [expr],
  )

  const fieldInfo = React.useMemo(() => {
    if (fieldCount === 5) return '5 fields (Unix: min hour dom mon dow)'
    if (fieldCount === 6) return '6 fields (Spring: sec min hour dom mon dow)'
    if (fieldCount === 7)
      return '7 fields (Spring: sec min hour dom mon dow year)'
    return `${fieldCount} fields (tidak didukung, gunakan 5, 6, atau 7 fields)`
  }, [fieldCount])

  const setPreset = (p: 'everyMin' | 'hourly' | 'daily' | 'weekly' | 'monthly') => {
    const now = new Date(baseNow)
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    if (p === 'everyMin') setExpr('* * * * *')
    if (p === 'hourly') setExpr(`${mm} * * * *`)
    if (p === 'daily') setExpr(`${mm} ${hh} * * *`)
    if (p === 'weekly') setExpr(`${mm} ${hh} * * 1`)
    if (p === 'monthly') setExpr(`${mm} ${hh} 1 * *`)
  }

  const copyUpcoming = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify(
        list.map(d => ({
          utc: d.toISOString(),
          local: fmtLong(d, tzSafe),
        })),
        null,
        2,
      ),
    )
  }

  return (
    <section className="grid gap-6">
      <div className="flex items-center gap-2">
        <AlarmClock className="h-5 w-5" />
        <h1 className="text-xl font-semibold">Cron Expression Builder</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ekspresi Cron</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label>Expression (5/6/7-field)</Label>
              <Input
                value={expr}
                onChange={e => setExpr(e.target.value)}
                placeholder="*/5 * * * *"
              />
              <p className="text-xs text-muted-foreground">
                Format:
                {' '}
                <code>min hour dom mon dow</code>
                {' '}
                (5-field Unix),
                {' '}
                <code>sec min hour dom mon dow</code>
                {' '}
                (6-field Spring),
                {' '}
                atau
                {' '}
                <code>sec min hour dom mon dow year</code>
                {' '}
                (7-field).
                {' '}
                • Dukung:
                {' '}
                <code>* , - /</code>
                {' '}
                dan nama (jan,feb / sun..sat)
                <br />
                <span className="italic">{fieldInfo}</span>
              </p>
            </div>
            <div className="grid gap-1">
              <Label>Time Zone</Label>
              <Input
                list="tz-list"
                value={tz}
                onChange={e => setTz(e.target.value)}
              />
              <datalist id="tz-list">
                {COMMON_TZS.map(t => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              {!tzValid && (
                <p className="text-xs text-red-600">Time zone tidak valid.</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPreset('everyMin')}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Every minute
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPreset('hourly')}
            >
              Hourly (same minute)
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPreset('daily')}
            >
              Daily (now HH:mm)
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPreset('weekly')}
            >
              Weekly (Mon, now HH:mm)
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPreset('monthly')}
            >
              Monthly (1st, now HH:mm)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>
            Next
            {' '}
            {count}
            {' '}
            Runs (
            {tzSafe}
            )
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Count</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={e =>
                  setCount(
                    Math.max(1, Math.min(100, Number(e.target.value || 10))),
                  )
                }
                className="w-24"
              />
            </div>
            <Button variant="outline" onClick={copyUpcoming}>
              <Copy className="mr-2 h-4 w-4" />
              Copy JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <ScrollArea className="h-80 rounded border p-3">
              <ol className="grid gap-2 text-sm list-decimal pl-5">
                {list.map((d, i) => (
                  <li key={i} className="rounded border p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium" suppressHydrationWarning>
                        {fmtLong(d, tzSafe)}
                      </span>
                      <Badge variant="outline">{d.toISOString()}</Badge>
                    </div>
                  </li>
                ))}
              </ol>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
