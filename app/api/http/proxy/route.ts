import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_BODY = 2 * 1024 * 1024
const TIMEOUT = 15000
const ALLOW_HOSTS = (process.env.HTTP_PROXY_ALLOW_HOSTS || '').split(',').map(s=>s.trim()).filter(Boolean)

function bad(msg: string, advice?: string) { return NextResponse.json({ ok:false, error: msg, advice }, { status: 400 }) }
function isPrivateHost(hostname: string) {
  const h = hostname.toLowerCase()
  if (h === 'localhost') return true
  if (h.endsWith('.local')) return true
  if (/^127\./.test(h)) return true
  if (/^10\./.test(h)) return true
  if (/^169\.254\./.test(h)) return true
  const m = h.match(/^172\.(\d+)\./); if (m) { const o = Number(m[1]); if (o>=16 && o<=31) return true }
  if (/^192\.168\./.test(h)) return true
  return false
}

export async function POST(req: NextRequest) {
  try {
    const { url, method, headers, body, bodyMode } = await req.json()
    if (!url || !method) return bad('url/method wajib')
    const u = new URL(url)
    if (!/^https?:$/.test(u.protocol)) return bad('protocol tidak didukung')
    if (isPrivateHost(u.hostname)) return bad('host ditolak')
    if (ALLOW_HOSTS.length && !ALLOW_HOSTS.includes(u.hostname)) return bad('host tidak ada di allowlist')

    const h: Record<string,string> = {}
    for (const [k,v] of Object.entries(headers || {})) {
      const lk = k.toLowerCase()
      if (['host','connection','content-length','accept-encoding'].includes(lk)) continue
      h[k] = String(v)
    }
    if (bodyMode === 'json' && !h['content-type']) h['content-type'] = 'application/json'
    if (bodyMode === 'form' && !h['content-type']) h['content-type'] = 'application/x-www-form-urlencoded'

    const ac = new AbortController()
    const to = setTimeout(()=>ac.abort('timeout'), TIMEOUT)

    const upstream = await fetch(u, { method, headers: h, body: body ?? undefined, signal: ac.signal })
    clearTimeout(to)

    const respHeaders = new Headers()
    upstream.headers.forEach((v,k)=>respHeaders.set(k,v))
    const ab = await upstream.arrayBuffer()
    const truncated = ab.byteLength > MAX_BODY
    const payload = truncated ? ab.slice(0, MAX_BODY) : ab
    return new NextResponse(payload, { status: upstream.status, headers: respHeaders })
  } catch(e:any) {
    const msg = String(e?.message || e)
    return bad(msg)
  }
}
