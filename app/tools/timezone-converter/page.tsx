'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Globe, Clock, Plus, X, Copy, RefreshCcw } from 'lucide-react'

type TzItem = string

const COMMON_TZS: TzItem[] = [
  'UTC',
  'Asia/Jakarta','Asia/Singapore','Asia/Bangkok','Asia/Tokyo','Asia/Seoul','Asia/Shanghai','Asia/Kolkata','Asia/Dubai',
  'Australia/Sydney','Pacific/Auckland','Pacific/Honolulu',
  'Europe/London','Europe/Paris','Europe/Berlin','Europe/Madrid','Europe/Rome','Europe/Moscow',
  'Africa/Johannesburg','Africa/Cairo',
  'America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Toronto','America/Sao_Paulo','America/Mexico_City'
]

// ---------- helpers ----------
function pad(n: number, w = 2) { return String(n).padStart(w, '0') }

function partsFromZoned(date: Date, timeZone: string) {
  if ( date === null || timeZone === null || timeZone === '' || !isValidTZ(timeZone) ) {
    return { y: 0, m: 0, d: 0, hh: 0, mm: 0, ss: 0, tzLabel: '' }
  } else {

    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZoneName: 'shortOffset'
    })
    const parts = fmt.formatToParts(date)
    const get = (t: Intl.DateTimeFormatPartTypes) => Number(parts.find(p => p.type === t)?.value || '0')
    const tzLabel = parts.find(p => p.type === 'timeZoneName')?.value || ''
    return { y: get('year'), m: get('month'), d: get('day'), hh: get('hour'), mm: get('minute'), ss: get('second'), tzLabel }
  }
}

function parseOffsetLabelToMinutes(lbl: string): number {
  // accepts e.g. "GMT+7", "GMT+07", "UTC+07:00", "GMT-05", "UTC-03:30"
  const m = lbl.match(/(GMT|UTC)?\s*([+-])(\d{1,2})(?::?(\d{2}))?/)
  if (!m) return 0
  const sign = m[2] === '-' ? -1 : 1
  const h = Number(m[3] || '0')
  const mins = Number(m[4] || '0')
  return sign * (h * 60 + mins)
}

function tzOffsetMinutesAt(timeZone: string, dateUTC: Date): number {
  const { tzLabel } = partsFromZoned(dateUTC, timeZone)
  return parseOffsetLabelToMinutes(tzLabel)
}

function ymdhmToString(y: number, m: number, d: number, hh: number, mm: number) {
  return `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}`
}

function nowLocalStringForTZ(timeZone: string) {
  const now = new Date()
  const p = partsFromZoned(now, timeZone)
  return ymdhmToString(p.y, p.m, p.d, p.hh, p.mm)
}

function isValidTZ(tz: string) {
  try {
    // will throw for invalid zones
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

// Given local components (interpreted in source TZ), compute UTC Date
function localInTZtoUTCDate(y: number, m: number, d: number, hh: number, mm: number, sourceTZ: string): Date {
  // iterative refine offset (handles DST)
  let baseUtc = Date.UTC(y, m - 1, d, hh, mm)
  for (let i = 0; i < 3; i++) {
    const off = tzOffsetMinutesAt(sourceTZ, new Date(baseUtc))
    baseUtc = Date.UTC(y, m - 1, d, hh, mm) - off * 60000
  }
  return new Date(baseUtc)
}

function formatLong(dateUTC: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    timeZoneName: 'shortOffset'
  })
  return fmt.format(dateUTC)
}

function asISOWithTZ(dateUTC: Date, timeZone: string) {
  const p = partsFromZoned(dateUTC, timeZone)
  // build like 2025-10-20T22:33:00 GMT+07
  return `${p.y}-${pad(p.m)}-${pad(p.d)}T${pad(p.hh)}:${pad(p.mm)}:${pad(p.ss)} ${p.tzLabel}`
}

// ---------- component ----------
export default function TimezoneConverterPage() {
  const [sourceTZ, setSourceTZ] = React.useState<string>('Asia/Jakarta')
  const [localYmdhm, setLocalYmdhm] = React.useState<string>(nowLocalStringForTZ('Asia/Jakarta'))
  const [targets, setTargets] = React.useState<string[]>(['UTC', 'Asia/Singapore', 'America/New_York'])
  const [addTarget, setAddTarget] = React.useState<string>('')

  // keep datetime-local in sync when source tz changes
  React.useEffect(() => {
    setLocalYmdhm(nowLocalStringForTZ(sourceTZ))
  }, [sourceTZ])

  const parsed = React.useMemo(() => {
    const m = localYmdhm.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/)
    if (!m || !isValidTZ(sourceTZ)) return null
    const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]), hh = Number(m[4]), mm = Number(m[5])
    const utc = localInTZtoUTCDate(y, mo, d, hh, mm, sourceTZ)
    return { y, mo, d, hh, mm, utc }
  }, [localYmdhm, sourceTZ])

  const results = React.useMemo(() => {
    if (!parsed) return []
    return targets.filter(isValidTZ).map(tz => ({
      tz,
      long: formatLong(parsed.utc, tz),
      iso: asISOWithTZ(parsed.utc, tz)
    }))
  }, [parsed, targets])

  const addTargetTZ = () => {
    const tz = addTarget.trim()
    if (tz && isValidTZ(tz) && !targets.includes(tz)) setTargets(prev => [...prev, tz])
    setAddTarget('')
  }

  const removeTarget = (tz: string) => setTargets(prev => prev.filter(t => t !== tz))

  const copyAll = async () => {
    if (!parsed) return
    const payload = results.map(r => ({ timeZone: r.tz, long: r.long, iso: r.iso }))
    await navigator.clipboard.writeText(JSON.stringify({
      sourceTZ, inputLocal: localYmdhm, utc: parsed.utc.toISOString(), conversions: payload
    }, null, 2))
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Timezone Converter</h1>
          <p className="text-sm text-muted-foreground">Convert date and time across any IANA timezone — live, no servers.</p>
        </div>
      </div>

      {/* Source Panel */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">Source</span>
        </div>
        <div className="p-4 grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label>Source Time Zone</Label>
              <Input
                list="tz-list"
                value={sourceTZ}
                onChange={(e) => setSourceTZ(e.target.value)}
                className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl"
              />
              <datalist id="tz-list">
                {COMMON_TZS.map(t => <option key={t} value={t} />)}
              </datalist>
              {!isValidTZ(sourceTZ) && <p className="text-xs text-red-600">Time zone tidak valid.</p>}
            </div>
            <div className="grid gap-1">
              <Label>Local Date-Time (di {sourceTZ || 'TZ'})</Label>
              <div className="flex gap-2">
                <Input
                  type="datetime-local"
                  value={localYmdhm}
                  onChange={(e) => setLocalYmdhm(e.target.value)}
                  className="flex-1 rounded-xl bg-muted/40 border-border/60 focus-visible:ring-primary/50"
                />
                <Button type="button" variant="secondary" onClick={() => setLocalYmdhm(nowLocalStringForTZ(sourceTZ))}>
                  <RefreshCcw className="mr-2 h-4 w-4" /> Now
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Format: YYYY-MM-DDTHH:mm (24 jam)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Target Timezones Panel */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">Target Timezones</span>
        </div>
        <div className="p-4 grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {targets.map(tz => (
              <span key={tz} className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-3 py-1.5 text-sm">
                <Clock className="h-3.5 w-3.5" /> {tz}
                <button title="Remove" onClick={() => removeTarget(tz)} className="ml-1 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              list="tz-list"
              placeholder="Add time zone (IANA)"
              value={addTarget}
              onChange={(e) => setAddTarget(e.target.value)}
              className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl"
            />
            <Button type="button" onClick={addTargetTZ}><Plus className="mr-2 h-4 w-4" /> Add</Button>
          </div>
        </div>
      </div>

      {/* Conversions Panel */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">Conversions</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={copyAll}><Copy className="mr-2 h-4 w-4" /> Copy JSON</Button>
          </div>
        </div>
        <div className="p-4">
          {!parsed ? (
            <p className="text-sm text-red-600">Input belum valid.</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tambahkan target time zone.</p>
          ) : (
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {results.map(r => (
                <div key={r.tz} className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <p className="font-medium text-sm">{r.tz}</p>
                  <p className="text-sm text-muted-foreground mt-1">{r.long}</p>
                  <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded-md mt-1 inline-block">{r.iso}</code>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
