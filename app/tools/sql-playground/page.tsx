'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Database, Play, RefreshCcw, Download, Copy, Table, Layers, AlertTriangle } from 'lucide-react'

type Driver = 'postgres' | 'mysql' | 'mariadb' | 'oracle'
type ExecResp =
  | { ok: true; driver: Driver; durationMs: number; rows: any[]; fields: string[]; rowCount: number; truncated: boolean; planText?: string }
  | { ok: false; error: string; advice?: string }

function useLocalStorage<T>(key: string, initial: T) {
  const [v, setV] = React.useState<T>(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial } catch { return initial } })
  React.useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  return [v, setV] as const
}

const SAMPLES: Record<'postgres'|'mysql', string> = {
  postgres: 'select current_date, current_time, version();',
  mysql: 'select now() as now, version() as version;',
}

export default function SqlPlaygroundPage() {
  const [profile, setProfile] = useLocalStorage<'pg_demo' | 'mysql_demo' | 'custom'>('sqlpg_profile', 'pg_demo')
  const [driver, setDriver] = useLocalStorage<Driver>('sqlpg_driver', 'postgres')
  const [host, setHost] = useLocalStorage('sqlpg_host', '127.0.0.1')
  const [port, setPort] = useLocalStorage('sqlpg_port', '5432')
  const [user, setUser] = useLocalStorage('sqlpg_user', '')
  const [password, setPassword] = useLocalStorage('sqlpg_password', '')
  const [database, setDatabase] = useLocalStorage('sqlpg_database', '')
  const [ssl, setSsl] = useLocalStorage('sqlpg_ssl', false as any)

  const [sql, setSql] = useLocalStorage('sqlpg_sql', SAMPLES.postgres)
  const [rows, setRows] = React.useState<any[]>([])
  const [fields, setFields] = React.useState<string[]>([])
  const [execInfo, setExecInfo] = React.useState<{ ms: number; count: number; truncated: boolean; plan?: string } | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (profile === 'pg_demo') { setDriver('postgres'); setSql(SAMPLES.postgres) }
    if (profile === 'mysql_demo') { setDriver('mysql'); setSql(SAMPLES.mysql) }
  }, [profile])

  const run = async (mode: 'query' | 'explain' = 'query') => {
    setBusy(true); setError(null)
    try {
      const body: any = { op: mode === 'explain' ? 'explain' : 'query', sql, limit: 500 }
      if (profile === 'custom') {
        body.driver = driver
        body.host = host
        body.port = Number(port)
        body.user = user
        body.password = password
        body.database = database
        body.ssl = ssl
      } else {
        body.connectionId = profile
      }
      const res = await fetch('/api/sql/exec', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      const data = (await res.json()) as ExecResp
      if (!data.ok) { setRows([]); setFields([]); setExecInfo(null); setError(data.error + (data.advice ? ` — ${data.advice}` : '')); return }
      setRows(data.rows); setFields(data.fields); setExecInfo({ ms: data.durationMs, count: data.rowCount, truncated: data.truncated, plan: data.planText })
    } catch (e: any) { setError(String(e?.message || e)); setRows([]); setFields([]); setExecInfo(null) } finally { setBusy(false) }
  }

  const fetchSchema = async () => {
    setBusy(true); setError(null)
    try {
      const body: any = { op: 'schema' }
      if (profile === 'custom') { body.driver = driver; body.host = host; body.port = Number(port); body.user = user; body.password = password; body.database = database; body.ssl = ssl }
      else { body.connectionId = profile }
      const res = await fetch('/api/sql/exec', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      const data = (await res.json()) as ExecResp
      if (!data.ok) { setError(data.error); return }
      setRows(data.rows); setFields(data.fields); setExecInfo({ ms: data.durationMs, count: data.rowCount, truncated: data.truncated })
    } catch (e: any) { setError(String(e?.message || e)) } finally { setBusy(false) }
  }

  const copyJSON = async () => { await navigator.clipboard.writeText(JSON.stringify(rows, null, 2)) }
  const downloadCSV = () => {
    if (!rows.length) return
    const header = fields.join(',')
    const body = rows.map(r => fields.map(f => {
      const v = r[f]; const s = v == null ? '' : String(v)
      return s.includes('"') || s.includes(',') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')).join('\n')
    const blob = new Blob([header + '\n' + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'result.csv'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <section className="grid gap-6">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5" />
        <h1 className="text-xl font-semibold">SQL Playground</h1>
        <Badge variant="outline">Profiles • Read-only</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Koneksi</CardTitle>
        </CardHeader>
        <div className="p-6 grid gap-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="grid gap-1">
              <Label>Connection Profile</Label>
              <select title="Connection Profile" className="border rounded h-10 px-3" value={profile} onChange={(e) => setProfile(e.target.value as any)}>
                <option value="pg_demo">PostgreSQL (demo)</option>
                <option value="mysql_demo">MySQL (demo)</option>
                <option value="custom">Custom (advanced)</option>
              </select>
            </div>

            {profile === 'custom' && (
              <>
                <div className="grid gap-1">
                  <Label>Driver</Label>
                  <select title='Driver' className="border rounded h-10 px-3" value={driver} onChange={(e) => setDriver(e.target.value as Driver)}>
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="mariadb">MariaDB</option>
                  </select>
                </div>
                <div className="grid gap-1">
                  <Label>Host</Label>
                  <Input value={host} onChange={(e) => setHost(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label>Port</Label>
                  <Input value={port} onChange={(e) => setPort(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label>User</Label>
                  <Input value={user} onChange={(e) => setUser(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label>Database</Label>
                  <Input value={database} onChange={(e) => setDatabase(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label>SSL</Label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" checked={!!ssl} onChange={(e) => setSsl(e.target.checked as any)} />
                    Enable
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={fetchSchema}><Layers className="mr-2 h-4 w-4" /> Fetch Schema</Button>
            <Button type="button" variant="secondary" onClick={() => setSql(profile === 'mysql_demo' ? SAMPLES.mysql : SAMPLES.postgres)}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Sample
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>SQL</CardTitle>
          <div className="flex gap-2">
            <Button disabled={busy} onClick={() => run('query')}><Play className="mr-2 h-4 w-4" /> Run</Button>
            <Button disabled={busy} variant="outline" onClick={() => run('explain')}>EXPLAIN</Button>
          </div>
        </CardHeader>
        <div className="p-6 grid gap-3">
          <Textarea rows={8} value={sql} onChange={(e) => setSql(e.target.value)} />
          <div className="flex items-center gap-2 text-xs text-amber-600"><AlertTriangle className="h-4 w-4" /> Server enforce read-only. Non-SELECT ditolak.</div>
        </div>
      </Card>

      <Results rows={rows} fields={fields} execInfo={execInfo} error={error} copyJSON={copyJSON} downloadCSV={downloadCSV} />
    </section>
  )
}

function Results({ rows, fields, execInfo, error, copyJSON, downloadCSV }:{
  rows:any[]; fields:string[]; execInfo:any; error:string|null; copyJSON:()=>void; downloadCSV:()=>void
}) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Hasil</CardTitle>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={copyJSON}><Copy className="mr-2 h-4 w-4" /> Copy JSON</Button>
          <Button variant="outline" onClick={downloadCSV}><Download className="mr-2 h-4 w-4" /> CSV</Button>
        </div>
      </CardHeader>
      <div className="p-6 grid gap-3">
        {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {execInfo && (
          <div className="text-xs text-muted-foreground">{execInfo.count} rows • {execInfo.ms} ms {execInfo.truncated ? '• truncated' : ''}</div>
        )}
        {execInfo?.plan && (
          <ScrollArea className="h-40 rounded border p-3"><pre className="text-xs">{execInfo.plan}</pre></ScrollArea>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="sticky top-0 bg-muted">
              <tr>{fields.map(f => <th key={f} className="border px-2 py-1 text-left">{f}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="odd:bg-muted/40">
                  {fields.map(f => <td key={f} className="border px-2 py-1 align-top">{r[f] == null ? '' : typeof r[f] === 'object' ? JSON.stringify(r[f]) : String(r[f])}</td>)}
                </tr>
              ))}
              {!rows.length && <tr><td className="px-2 py-3 text-muted-foreground" colSpan={Math.max(1, fields.length)}>Tidak ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  )
}
