import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

type Driver = 'postgres' | 'mysql' | 'mariadb' | 'oracle'

type Body = {
  op: 'query' | 'schema' | 'explain'
  driver?: Driver
  connectionId?: 'pg_demo' | 'mysql_demo'
  host?: string
  port?: number
  user?: string
  password?: string
  database?: string
  serviceName?: string
  ssl?: boolean
  readOnly?: boolean
  sql?: string
  limit?: number
}

const ALLOW_CUSTOM = process.env.SQL_PLAYGROUND_ALLOW_CUSTOM === 'true'
const ENFORCE_RO = process.env.SQL_PLAYGROUND_ENFORCE_READONLY !== 'false'
const MAX_ROWS = Number(process.env.SQL_PLAYGROUND_MAX_ROWS || 500)
const STMT_TIMEOUT_MS = Number(process.env.SQL_PLAYGROUND_STMT_TIMEOUT_MS || 15000)

const PROFILES: Record<string, { driver: Driver; url: string }> = {
  pg_demo: { driver: 'postgres', url: process.env.PG_PLAYGROUND_URL || '' },
  mysql_demo: { driver: 'mysql', url: process.env.MYSQL_PLAYGROUND_URL || '' },
}

function bad(msg: string, advice?: string) { return NextResponse.json({ ok: false, error: msg, advice }) }
function ok(payload: any) { return NextResponse.json({ ok: true, ...payload }) }

function isSelectLike(sql: string) {
  const s = sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '').trim().toLowerCase()
  if (!s) return false
  const starts = ['select', 'with', 'show', 'describe', 'desc', 'explain']
  return starts.some((k) => s.startsWith(k))
}

function parseDbUrl(url: string) {
  const u = new URL(url)
  const driver = u.protocol.replace(':', '')
  const host = u.hostname
  const port = Number(u.port || (driver === 'postgresql' ? 5432 : 3306))
  const user = decodeURIComponent(u.username)
  const password = decodeURIComponent(u.password)
  const database = u.pathname.replace(/^\//, '')
  if (driver === 'postgresql' || driver === 'postgres') return { driver: 'postgres' as Driver, host, port, user, password, database }
  if (driver === 'mysql') return { driver: 'mysql' as Driver, host, port, user, password, database }
  throw new Error('Unsupported DSN driver')
}

function now() { return Date.now() }

async function execPostgres(op: Body['op'], cfg: any, sql: string, limit: number) {
  const { Client } = await import('pg')
  const client = new Client({ ...cfg, ssl: cfg.ssl ? { rejectUnauthorized: false } : undefined })
  await client.connect()
  try {
    await client.query(`set statement_timeout = ${STMT_TIMEOUT_MS}`)
    let runSql = sql
    const t0 = now()
    if (op === 'schema') {
      runSql = `
        select table_schema, table_name, table_type
        from information_schema.tables
        where table_schema not in ('pg_catalog','information_schema')
        order by table_schema, table_name
      `
    } else if (op === 'explain') {
      runSql = `EXPLAIN (FORMAT TEXT) ${sql}`
    }
    const res = await client.query(runSql)
    const durationMs = now() - t0
    if (op === 'explain') {
      const planText = res.rows.map((r: any) => Object.values(r)[0]).join('\n')
      return ok({ driver: 'postgres', durationMs, rows: [], fields: [], rowCount: 0, truncated: false, planText })
    }
    const fields = res.fields?.map((f: any) => f.name) ?? Object.keys(res.rows[0] || {})
    const rows = res.rows.slice(0, limit)
    return ok({ driver: 'postgres', durationMs, rows, fields, rowCount: res.rowCount ?? rows.length, truncated: (res.rows.length > rows.length) })
  } finally { await client.end().catch(() => {}) }
}

async function execMySQL(op: Body['op'], cfg: any, sql: string, limit: number, driver: 'mysql' | 'mariadb') {
  const mysql = await import('mysql2/promise')
  const conn = await mysql.createConnection({ ...cfg, ssl: cfg.ssl ? { rejectUnauthorized: false } : undefined, connectTimeout: STMT_TIMEOUT_MS })
  try {
    let runSql = sql
    const t0 = now()
    if (op === 'schema') {
      runSql = `
        select table_schema, table_name, table_type
        from information_schema.tables
        where table_schema not in ('mysql','information_schema','performance_schema','sys')
        order by table_schema, table_name
      `
    } else if (op === 'explain') {
      runSql = `EXPLAIN ${sql}`
    }
    const [rowsAny, fieldsAny] = await conn.execute(runSql)
    const durationMs = now() - t0
    if (op === 'explain') {
      const planText = Array.isArray(rowsAny) ? rowsAny.map((r: any) => JSON.stringify(r)).join('\n') : String(rowsAny)
      return ok({ driver, durationMs, rows: [], fields: [], rowCount: 0, truncated: false, planText })
    }
    const rows = Array.isArray(rowsAny) ? rowsAny.slice(0, limit) : []
    const fields = Array.isArray(fieldsAny) ? (fieldsAny as any[]).map((f: any) => f.name) : Object.keys(rows[0] || {})
    return ok({ driver, durationMs, rows, fields, rowCount: Array.isArray(rowsAny) ? rowsAny.length : rows.length, truncated: (Array.isArray(rowsAny) && rowsAny.length > rows.length) })
  } finally { await conn.end().catch(() => {}) }
}

export async function POST(req: NextRequest) {
  try {
    const b = (await req.json()) as Body
    const op = b.op
    const limit = Math.max(1, Math.min(Number(b.limit || MAX_ROWS), MAX_ROWS))
    if (!op) return bad('Missing op')
    if (op !== 'schema' && !(b.sql || '').trim()) return bad('SQL kosong')

    const enforceRO = ENFORCE_RO
    const sql = String(b.sql || '')

    if (enforceRO && op === 'query' && !isSelectLike(sql)) {
      return bad('Hanya SELECT/SHOW/DESC/EXPLAIN yang diizinkan (read-only)')
    }

    let driver: Driver
    let cfg: any = {}
    if (b.connectionId) {
      const prof = PROFILES[b.connectionId]
      if (!prof || !prof.url) return bad('Connection profile tidak tersedia')
      const parsed = parseDbUrl(prof.url)
      driver = parsed.driver
      cfg = { host: parsed.host, port: parsed.port, user: parsed.user, password: parsed.password, database: parsed.database }
    } else {
      if (!ALLOW_CUSTOM) return bad('Custom connection dinonaktifkan', 'Gunakan profile yang disediakan')
      if (!b.driver || !b.host || !b.user) return bad('Konfigurasi koneksi kurang')
      driver = b.driver
      cfg = { host: b.host, port: b.port, user: b.user, password: b.password, database: b.database, ssl: b.ssl }
    }

    if (driver === 'postgres') return await execPostgres(op, cfg, sql, limit)
    if (driver === 'mysql' || driver === 'mariadb') return await execMySQL(op, cfg, sql, limit, driver)

    return bad('Driver tidak didukung untuk profile ini')
  } catch (e: any) {
    return bad(e?.message || String(e))
  }
}
