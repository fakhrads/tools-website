'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Copy, Download, Play, Plus, Trash2 } from 'lucide-react'

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
      <Input placeholder="Header" value={h.k} onChange={e=>{ const a=[...headers]; a[i]={...h,k:e.target.value}; setHeaders(a)}} className="min-w-0" />
      <Input placeholder="Value" value={h.v} onChange={e=>{ const a=[...headers]; a[i]={...h,v:e.target.value}; setHeaders(a)}} className="min-w-0" />
      <Button variant="ghost" size="icon" onClick={()=>setHeaders(headers.filter((_,x)=>x!==i))}><Trash2 className="h-4 w-4" /></Button>
    </div>
  ))

  return (
    <section className="grid gap-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">HTTP Requester</h1>
        <Badge variant="outline">Mini Postman</Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center gap-3">
          <Select value={method} onValueChange={(v)=>setMethod(v)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'].map(m=><SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://api.example.com/path" className="flex-1 min-w-0" />
          <Button disabled={busy} onClick={run}><Play className="mr-2 h-4 w-4" /> Send</Button>
          <Button variant="secondary" onClick={saveReq}><Plus className="mr-2 h-4 w-4" /> Save</Button>
          <label className="ml-auto inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!useProxy} onChange={e=>setUseProxy(e.target.checked as any)} />
            Proxy
          </label>
        </CardHeader>

        <CardContent className="grid gap-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>Headers</Label>
                <Button variant="outline" size="sm" onClick={addHeader}><Plus className="mr-2 h-4 w-4" /> Add Header</Button>
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
                {auth.type==='bearer' && <Input placeholder="Token" value={auth.bearer||''} onChange={e=>setAuth({...auth,bearer:e.target.value})} />}
                {auth.type==='basic' && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Username" value={auth.basicUser||''} onChange={e=>setAuth({...auth,basicUser:e.target.value})} />
                    <Input type="password" placeholder="Password" value={auth.basicPass||''} onChange={e=>setAuth({...auth,basicPass:e.target.value})} />
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-3">
                  <Label>Body</Label>
                  <select title='Body' className="border rounded h-9 px-2" value={bodyMode} onChange={e=>setBodyMode(e.target.value)}>
                    <option value="none">none</option>
                    <option value="json">json</option>
                    <option value="text">text</option>
                    <option value="form">form-urlencoded</option>
                  </select>
                  {bodyMode==='json' && <Badge variant="outline">content-type: application/json</Badge>}
                  {bodyMode==='form' && <Badge variant="outline">content-type: application/x-www-form-urlencoded</Badge>}
                </div>
                {bodyMode!=='none' && (
                  <>
                    {bodyMode==='json' && <Textarea rows={8} value={bodyText} onChange={e=>setBodyText(e.target.value)} placeholder='{"key":"value"}' className="font-mono" />}
                    {bodyMode==='text' && <Textarea rows={8} value={bodyText} onChange={e=>setBodyText(e.target.value)} placeholder='Plain text' className="font-mono" />}
                    {bodyMode==='form' && <Textarea rows={8} value={bodyText} onChange={e=>setBodyText(e.target.value)} placeholder='key=value\nfoo=bar' className="font-mono" />}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Response</CardTitle>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={copyCurl}><Copy className="mr-2 h-4 w-4" /> curl</Button>
            <Button variant="outline" onClick={copyFetch}><Copy className="mr-2 h-4 w-4" /> fetch</Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {err && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

          {resp && (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatusBadge code={resp.status} text={resp.statusText} />
                <Badge variant="outline">{resp.duration} ms</Badge>
                <Badge variant="outline">{resp.size} B{resp.truncated ? ' • truncated' : ''}</Badge>
                {resp.contentType && <Badge variant="outline">{resp.contentType}</Badge>}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {saved.map(s => (
              <div key={s.id} className="rounded border p-3 text-sm">
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
        </CardContent>
      </Card>
    </section>
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
