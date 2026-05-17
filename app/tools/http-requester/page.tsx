'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Copy, Play, Plus, Trash2, Globe } from 'lucide-react'

type KV = { k: string; v: string; on: boolean }
type ReqSaved = {
  id: string; name: string; method: string; url: string;
  headers: KV[]; bodyMode: string; bodyText: string;
  auth: { type: string; bearer?: string; basicUser?: string; basicPass?: string };
  useProxy: boolean
}

function useLocal<T>(key: string, init: T) {
  const [v, setV] = React.useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init } catch { return init }
  })
  React.useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  return [v, setV] as const
}

function toCurl(method: string, url: string, headers: Record<string,string>, body: string | undefined) {
  const h = Object.entries(headers).map(([k,v]) => `-H ${JSON.stringify(k + ': ' + v)}`).join(' ')
  const d = body != null && body !== '' ? `--data-raw ${JSON.stringify(body)}` : ''
  return `curl -X ${method.toUpperCase()} ${h} ${d} ${JSON.stringify(url)}`.trim()
}
function toFetch(method: string, url: string, headers: Record<string,string>, body: string | undefined) {
  const o: any = { method, headers }
  if (body != null && body !== '') o.body = body
  return `await fetch(${JSON.stringify(url)}, ${JSON.stringify(o, null, 2)});`
}

export default function HttpRequesterPage() {
  const [method, setMethod] = useLocal('httpr_method','GET')
  const [url, setUrl] = useLocal('httpr_url','https://httpbin.org/get')
  const [useProxy, setUseProxy] = useLocal('httpr_proxy', true as any)
  const [headers, setHeaders] = useLocal<KV[]>('httpr_headers',[{k:'Accept',v:'application/json',on:true}])
  const [bodyMode, setBodyMode] = useLocal('httpr_bodymode','none')
  const [bodyText, setBodyText] = useLocal('httpr_body','')
  const [auth, setAuth] = useLocal('httpr_auth',{ type:'none', bearer:'', basicUser:'', basicPass:'' })
  const [saved, setSaved] = useLocal<ReqSaved[]>('httpr_saved',[])
  const [resp, setResp] = React.useState<{status:number; statusText:string; duration:number; size:number; headers:Record<string,string>; bodyText:string; truncated?:boolean; contentType?:string} | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  const [viewMode, setViewMode] = React.useState<'pretty'|'raw'>('pretty')
  const [wrap, setWrap] = React.useState<boolean>(true)

  const hdrObj = React.useMemo(() => {
    const o: Record<string,string> = {}
    headers.filter(h=>h.on && h.k.trim()!=='').forEach(h => o[h.k] = h.v)
    if (auth.type === 'bearer' && auth.bearer) o['Authorization'] = `Bearer ${auth.bearer}`
    if (auth.type === 'basic' && auth.basicUser) o['Authorization'] = 'Basic ' + btoa(`${auth.basicUser}:${auth.basicPass||''}`)
    return o
  }, [headers, auth])

  const builtBody = React.useMemo(() => {
    if (method === 'GET' || bodyMode === 'none') return undefined
    if (bodyMode === 'json') { try { JSON.parse(bodyText || '') } catch {} ; return bodyText }
    if (bodyMode === 'form') {
      const params = new URLSearchParams()
      for (const line of (bodyText||'').split('\n')) {
        const [k,...rest] = line.split('=')
        if (!k) continue
        params.append(k, rest.join('='))
      }
      return params.toString()
    }
    return bodyText
  }, [method, bodyMode, bodyText])

  const run = async () => {
    setBusy(true); setErr(null); setResp(null)
    try {
      const t0 = performance.now()
      let r: Response
      if (useProxy) {
        r = await fetch('/api/http/proxy', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ url, method, headers: hdrObj, body: builtBody, bodyMode })
        })
      } else {
        const opt: RequestInit = { method, headers: hdrObj }
        if (builtBody !== undefined) opt.body = builtBody
        r = await fetch(url, opt)
      }
      const t1 = performance.now()
      const headerObj: Record<string,string> = {}
      r.headers.forEach((v,k)=>headerObj[k]=v)
      const ct = r.headers.get('content-type') || ''
      const isText = /json|text|xml|yaml|csv|html/.test(ct)
      const ab = await r.arrayBuffer()
      const MAX = 2 * 1024 * 1024
      const truncated = ab.byteLength > MAX
      const payload = truncated ? ab.slice(0, MAX) : ab
      const decoded = new TextDecoder().decode(payload)
      const bodyShown = isText ? decoded : '[binary]'
      setResp({
        status:r.status, statusText:r.statusText,
        duration: Math.round(t1-t0), size: ab.byteLength,
        headers: headerObj, bodyText: bodyShown, truncated, contentType: ct
      })
    } catch(e:any) {
      setErr(String(e?.message || e))
    } finally { setBusy(false) }
  }

  const addHeader = () => setHeaders(prev => [...prev, {k:'',v:'',on:true}])
  const saveReq = () => {
    const s: ReqSaved = { id: crypto.randomUUID(), name: `${method} ${safeHost(url)}`, method, url, headers, bodyMode, bodyText, auth, useProxy }
    setSaved(prev => [s, ...prev].slice(0,100))
  }
  const loadReq = (r: ReqSaved) => { setMethod(r.method); setUrl(r.url); setHeaders(r.headers); setBodyMode(r.bodyMode); setBodyText(r.bodyText); setAuth(r.auth as any); setUseProxy(r.useProxy as any) }
  const delReq  = (id: string) => setSaved(prev => prev.filter(x=>x.id!==id))

  const copyCurl  = async () => navigator.clipboard.writeText(toCurl(method, url, hdrObj, builtBody))
  const copyFetch = async () => navigator.clipboard.writeText(toFetch(method, url, hdrObj, builtBody))

  const hdrRows = headers.map((h, i) => (
    <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 md:gap-3 items-center">
      <input title='Checkbox' type="checkbox" checked={h.on} onChange={e=>{ const a=[...headers]; a[i]={...h,on:e.target.checked}; setHeaders(a)}} />
      <Input placeholder="Header" value={h.k} onChange={e=>{ const a=[...headers]; a[i]={...h,k:e.target.value}; setHeaders(a)}} className="min-w-0 bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl" />
      <Input placeholder="Value" value={h.v} onChange={e=>{ const a=[...headers]; a[i]={...h,v:e.target.value}; setHeaders(a)}} className="min-w-0 bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl" />
      <Button variant="ghost" size="icon" onClick={()=>setHeaders(headers.filter((_,x)=>x!==i))}><Trash2 className="h-4 w-4" /></Button>
    </div>
  ))

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">HTTP Requester</h1>
          <p className="text-sm text-muted-foreground">Make HTTP requests directly from your browser — supports headers, auth, and body modes.</p>
        </div>
      </div>

      {/* Request Panel */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">Request</span>
          <div className="flex items-center gap-1.5">
            <Button type="button" disabled={busy} onClick={run} size="sm"><Play className="mr-2 h-4 w-4" /> Send</Button>
            <Button type="button" variant="secondary" size="sm" onClick={saveReq}><Plus className="mr-2 h-4 w-4" /> Save</Button>
          </div>
        </div>
        <div className="p-4 grid gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={method} onValueChange={(v)=>setMethod(v)}>
              <SelectTrigger className="w-32 bg-muted/40 border-border/60 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'].map(m=><SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://api.example.com/path" className="flex-1 min-w-0 bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl" />
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!useProxy} onChange={e=>setUseProxy(e.target.checked as any)} />
              Proxy
            </label>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">Configuration</span>
        </div>
        <div className="p-4 grid gap-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>Headers</Label>
                <Button type="button" variant="outline" size="sm" onClick={addHeader}><Plus className="mr-2 h-4 w-4" /> Add Header</Button>
              </div>
              <div className="grid gap-2">{hdrRows}</div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Auth</Label>
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="inline-flex items-center gap-2"><input type="radio" name="auth" checked={auth.type==='none'} onChange={()=>setAuth({...auth,type:'none'})} />None</label>
                  <label className="inline-flex items-center gap-2"><input type="radio" name="auth" checked={auth.type==='bearer'} onChange={()=>setAuth({...auth,type:'bearer'})} />Bearer</label>
                  <label className="inline-flex items-center gap-2"><input type="radio" name="auth" checked={auth.type==='basic'} onChange={()=>setAuth({...auth,type:'basic'})} />Basic</label>
                </div>
                {auth.type==='bearer' && <Input placeholder="Token" value={auth.bearer||''} onChange={e=>setAuth({...auth,bearer:e.target.value})} className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl" />}
                {auth.type==='basic' && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Username" value={auth.basicUser||''} onChange={e=>setAuth({...auth,basicUser:e.target.value})} className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl" />
                    <Input type="password" placeholder="Password" value={auth.basicPass||''} onChange={e=>setAuth({...auth,basicPass:e.target.value})} className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl" />
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-3">
                  <Label>Body</Label>
                  <select title='Body' className="h-9 rounded-xl border border-border/60 bg-background px-3 text-sm" value={bodyMode} onChange={e=>setBodyMode(e.target.value)}>
                    <option value="none">none</option>
                    <option value="json">json</option>
                    <option value="text">text</option>
                    <option value="form">form-urlencoded</option>
                  </select>
                  {bodyMode==='json' && <span className="text-xs text-muted-foreground">content-type: application/json</span>}
                  {bodyMode==='form' && <span className="text-xs text-muted-foreground">content-type: application/x-www-form-urlencoded</span>}
                </div>
                {bodyMode!=='none' && (
                  <>
                    {bodyMode==='json' && <Textarea rows={8} value={bodyText} onChange={e=>setBodyText(e.target.value)} placeholder='{"key":"value"}' className="font-mono bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl" />}
                    {bodyMode==='text' && <Textarea rows={8} value={bodyText} onChange={e=>setBodyText(e.target.value)} placeholder='Plain text' className="font-mono bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl" />}
                    {bodyMode==='form' && <Textarea rows={8} value={bodyText} onChange={e=>setBodyText(e.target.value)} placeholder='key=value\nfoo=bar' className="font-mono bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl" />}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Panel */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">Response</span>
          <div className="flex items-center gap-1.5">
            <Button type="button" variant="secondary" size="sm" onClick={copyCurl}><Copy className="mr-2 h-4 w-4" /> curl</Button>
            <Button type="button" variant="outline" size="sm" onClick={copyFetch}><Copy className="mr-2 h-4 w-4" /> fetch</Button>
          </div>
        </div>
        <div className="p-4 grid gap-3">
          {err && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

          {resp && (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatusBadge code={resp.status} text={resp.statusText} />
                <span className="rounded border border-border/60 bg-muted/40 px-2 py-0.5 text-xs">{resp.duration} ms</span>
                <span className="rounded border border-border/60 bg-muted/40 px-2 py-0.5 text-xs">{resp.size} B{resp.truncated ? ' • truncated' : ''}</span>
                {resp.contentType && <span className="rounded border border-border/60 bg-muted/40 px-2 py-0.5 text-xs">{resp.contentType}</span>}
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
                      <span className="text-xs font-medium">Headers</span>
                    </div>
                    <ScrollArea className="h-40">
                      <pre className="p-3 text-xs leading-relaxed">
                        {Object.entries(resp.headers).map(([k,v])=>(
                          <div key={k}><span className="text-sky-300">{k}</span><span className="text-zinc-400">: </span><span className="text-emerald-300">{v}</span></div>
                        ))}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
                      <div className="text-xs font-medium">Body</div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs inline-flex items-center gap-1">
                          <input type="checkbox" checked={wrap} onChange={(e)=>setWrap(e.target.checked)} /> Wrap
                        </label>
                        <div className="inline-flex overflow-hidden rounded-md border border-zinc-700">
                          <button className={`px-2 py-1 text-xs ${viewMode==='pretty'?'bg-zinc-800':''}`} onClick={()=>setViewMode('pretty')}>Pretty</button>
                          <button className={`px-2 py-1 text-xs ${viewMode==='raw'?'bg-zinc-800':''}`} onClick={()=>setViewMode('raw')}>Raw</button>
                        </div>
                      </div>
                    </div>
                    <ScrollArea className="h-80">
                      {renderBody(resp.bodyText, resp.contentType || '', viewMode, wrap)}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Saved Panel */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">Saved</span>
        </div>
        <div className="p-4 grid gap-2">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {saved.map(s => (
              <div key={s.id} className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{s.name}</div>
                  <Button size="icon" variant="ghost" onClick={()=>delReq(s.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.method} {s.url}</div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={()=>loadReq(s)}>Load</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function prettyMaybe(s: string) { try { return JSON.stringify(JSON.parse(s), null, 2) } catch { return s } }
function safeHost(u: string) { try { return new URL(u).host } catch { return u } }

function StatusBadge({ code, text }: { code: number; text: string }) {
  const tone = code < 200 ? 'bg-sky-600' : code < 300 ? 'bg-emerald-600' : code < 400 ? 'bg-cyan-600' : code < 500 ? 'bg-amber-600' : 'bg-rose-600'
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium text-white ${tone}`}>{code} {text}</span>
}

function renderBody(body: string, ct: string, mode: 'pretty'|'raw', wrap: boolean) {
  const isJSON = /json/.test(ct)
  const isXML  = /xml/.test(ct)
  const isHTML = /html/.test(ct)
  const content = mode === 'pretty'
    ? (isJSON ? highlightJSON(prettyMaybe(body)) : (isXML || isHTML) ? highlightXML(body) : escapeHtml(body))
    : escapeHtml(body)
  return (
    <pre
      className={`p-3 text-xs leading-relaxed font-mono ${wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'} `}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

function escapeHtml(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function highlightJSON(src: string) {
  const s = escapeHtml(src)
  return s.replace(/("(?:\\.|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)/g, (m) => {
    let cls = 'text-rose-300'
    if (/^"/.test(m)) cls = /:$/.test(m) ? 'text-sky-300' : 'text-emerald-300'
    else if (/true|false/.test(m)) cls = 'text-purple-300'
    else if (/null/.test(m)) cls = 'text-fuchsia-300'
    return `<span class="${cls}">${m}</span>`
  })
}

function highlightXML(src: string) {
  const s = escapeHtml(src)
  return s
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, `<span class="text-zinc-400">$1</span>`)
    .replace(/(&lt;\/?)([a-zA-Z0-9:_-]+)([^&]*?)(\/?&gt;)/g, (_m, a, b, c, d) => {
      const attrs = c.replace(/([a-zA-Z_:][\w:.-]*)(="[^"]*")/g, `<span class="text-sky-300">$1</span><span class="text-zinc-400">=</span><span class="text-amber-300">$2</span>`)
      return `<span class="text-zinc-400">${a}</span><span class="text-emerald-300">${b}</span>${attrs}<span class="text-zinc-400">${d}</span>`
    })
}
