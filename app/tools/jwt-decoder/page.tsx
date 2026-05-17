'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShieldCheck, Key, FileJson, AlertTriangle, CheckCircle2, Copy } from 'lucide-react'

type JwtParts = { header: any, payload: any, signatureB64u: string, alg?: string, signingInput: string }

function b64urlToUint8(b64u: string): ArrayBuffer {
  let base64 = b64u.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad) base64 += '='.repeat(4 - pad)
  const binStr = atob(base64)
  const out = new Uint8Array(binStr.length)
  for (let i = 0; i < binStr.length; i++) out[i] = binStr.charCodeAt(i)
  return out.buffer
}

function b64urlJsonDecode(part: string) {
  try {
    const bytes = b64urlToUint8(part)
    const dec = new TextDecoder().decode(bytes)
    return JSON.parse(dec)
  } catch {
    return null
  }
}

function decodeJWT(token: string): JwtParts | null {
  const [h, p, s] = token.trim().split('.')
  if (!h || !p) return null
  const header = b64urlJsonDecode(h)
  const payload = b64urlJsonDecode(p)
  if (!header || !payload) return null
  return { header, payload, signatureB64u: s || '', alg: header.alg, signingInput: `${h}.${p}` }
}

function claimTime(ts: any) {
  if (typeof ts !== 'number') return null
  const d = new Date(ts * 1000)
  const inSec = Math.round((d.getTime() - Date.now()) / 1000)
  return { date: d, relSec: inSec }
}

async function verifyHS256(signingInput: string, sigB64u: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )
  return crypto.subtle.verify('HMAC', key, b64urlToUint8(sigB64u), new TextEncoder().encode(signingInput))
}

function pemToArrayBuffer(pem: string) {
  const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----/g, '').replace(/-----END PUBLIC KEY-----/g, '').replace(/\s+/g, '')
  const binStr = atob(b64)
  const buf = new ArrayBuffer(binStr.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < view.length; i++) view[i] = binStr.charCodeAt(i)
  return buf
}

async function verifyRS256(signingInput: string, sigB64u: string, publicKeyPem: string) {
  const key = await crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(publicKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  )
  return crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToUint8(sigB64u), new TextEncoder().encode(signingInput))
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    year:'numeric', month:'short', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false,
    timeZoneName:'short'
  }).format(d)
}

export default function JwtDecoderPage() {
  const [token, setToken] = React.useState<string>('')
  const [decoded, setDecoded] = React.useState<JwtParts | null>(null)
  const [alg, setAlg] = React.useState<string>('auto') // auto/HS256/RS256
  const [secret, setSecret] = React.useState<string>('') // HS256
  const [publicKey, setPublicKey] = React.useState<string>('') // RS256 PEM
  const [verifyResult, setVerifyResult] = React.useState<{ok:boolean|null,msg:string}>({ok:null,msg:''})

  React.useEffect(() => {
    const d = decodeJWT(token)
    setDecoded(d)
    setVerifyResult({ok:null,msg:''})
    if (d?.alg) setAlg('auto')
  }, [token])

  const hdr = decoded?.header ?? {}
  const pay = decoded?.payload ?? {}

  const exp = claimTime(pay.exp)
  const nbf = claimTime(pay.nbf)
  const iat = claimTime(pay.iat)
  const now = Date.now()

  const statusBadges = (
    <div className="flex flex-wrap gap-2">
      {exp && (exp.date.getTime() < now
        ? <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"><AlertTriangle className="h-3.5 w-3.5" /> expired</span>
        : <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border border-border/60 bg-muted/40 text-muted-foreground">exp: {fmtDate(exp.date)}</span>)}
      {nbf && (nbf.date.getTime() > now
        ? <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">nbf: {fmtDate(nbf.date)} (not yet valid)</span>
        : <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border border-border/60 bg-muted/40 text-muted-foreground">nbf: {fmtDate(nbf.date)}</span>)}
      {iat && <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border border-border/60 bg-muted/40 text-muted-foreground">iat: {fmtDate(iat.date)}</span>}
      {!decoded?.signatureB64u && <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">unsigned (no signature)</span>}
    </div>
  )

  const doVerify = async () => {
    try {
      if (!decoded) { setVerifyResult({ok:false,msg:'Token tidak valid'}); return }
      const useAlg = alg === 'auto' ? (decoded.alg || '') : alg
      if (!useAlg) { setVerifyResult({ok:false,msg:'alg tidak terdeteksi'}); return }

      if (useAlg === 'HS256') {
        if (!secret) { setVerifyResult({ok:false,msg:'Masukkan secret untuk HS256'}); return }
        const ok = await verifyHS256(decoded.signingInput, decoded.signatureB64u, secret)
        setVerifyResult({ok, msg: ok ? 'Signature valid (HS256)' : 'Signature invalid (HS256)'})
        return
      }

      if (useAlg === 'RS256') {
        if (!publicKey.includes('BEGIN PUBLIC KEY')) { setVerifyResult({ok:false,msg:'Tempelkan Public Key (PEM) yang benar'}); return }
        const ok = await verifyRS256(decoded.signingInput, decoded.signatureB64u, publicKey)
        setVerifyResult({ok, msg: ok ? 'Signature valid (RS256)' : 'Signature invalid (RS256)'})
        return
      }

      setVerifyResult({ok:false,msg:`Alg ${useAlg} belum didukung untuk verifikasi`})
    } catch (e:any) {
      setVerifyResult({ok:false,msg:`Verify error: ${e?.message || e}`})
    }
  }

  const copyDecoded = async () => {
    await navigator.clipboard.writeText(JSON.stringify({ header: hdr, payload: pay }, null, 2))
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">JWT Decoder</h1>
          <p className="text-sm text-muted-foreground">Decode and verify JSON Web Tokens — runs entirely in your browser, nothing sent to servers.</p>
        </div>
      </div>

      {/* Token input panel */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">JWT Token</span>
          <div className="flex items-center gap-1.5">
            {verifyResult.ok === null ? null : verifyResult.ok
              ? <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"><CheckCircle2 className="h-3.5 w-3.5" /> valid</span>
              : <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"><AlertTriangle className="h-3.5 w-3.5" /> invalid</span>
            }
          </div>
        </div>
        <div className="p-4 grid gap-3">
          <Textarea
            rows={5}
            placeholder="Paste JWT here (header.payload.signature)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl"
          />
          <div className="text-xs text-muted-foreground">
            Token is not sent to any server — decoding happens entirely in your browser.
          </div>
        </div>
      </div>

      {/* Header / Payload panels */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
            <span className="text-sm font-medium">Header</span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border border-border/60 bg-muted/40 text-muted-foreground">
                {hdr.alg ? `alg: ${hdr.alg}` : 'no alg'}
              </span>
            </div>
          </div>
          <div className="p-4">
            <ScrollArea className="h-52 rounded-xl border border-border/60 bg-muted/40 p-3">
              <pre className="text-xs font-mono leading-relaxed">{JSON.stringify(hdr, null, 2)}</pre>
            </ScrollArea>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
            <span className="text-sm font-medium">Payload</span>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="outline" onClick={copyDecoded} className="h-7 px-2.5 text-xs">
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy JSON
              </Button>
            </div>
          </div>
          <div className="p-4 grid gap-3">
            {statusBadges}
            <ScrollArea className="h-52 rounded-xl border border-border/60 bg-muted/40 p-3">
              <pre className="text-xs font-mono leading-relaxed">{JSON.stringify(pay, null, 2)}</pre>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Verify Signature panel */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">Verify Signature (optional)</span>
          <div className="flex items-center gap-1.5">
            {verifyResult.ok === null
              ? <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border border-border/60 bg-muted/40 text-muted-foreground">idle</span>
              : verifyResult.ok
              ? <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"><CheckCircle2 className="h-3.5 w-3.5" /> valid</span>
              : <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"><AlertTriangle className="h-3.5 w-3.5" /> invalid</span>
            }
          </div>
        </div>
        <div className="p-4 grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label>Algorithm</Label>
              <Input
                list="alg-list"
                value={alg}
                onChange={(e) => setAlg(e.target.value)}
                className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl"
              />
              <datalist id="alg-list">
                <option value="auto" />
                <option value="HS256" />
                <option value="RS256" />
              </datalist>
              <p className="text-xs text-muted-foreground">auto: follows header.alg</p>
            </div>
            { (alg === 'HS256' || (alg === 'auto' && decoded?.alg === 'HS256')) && (
              <div className="grid gap-1">
                <Label><Key className="inline h-3.5 w-3.5 mr-1" /> Secret (HS256)</Label>
                <Input
                  type="password"
                  value={secret}
                  onChange={(e)=>setSecret(e.target.value)}
                  placeholder="shared secret"
                  className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl"
                />
              </div>
            )}
            { (alg === 'RS256' || (alg === 'auto' && decoded?.alg === 'RS256')) && (
              <div className="grid gap-1 md:col-span-2">
                <Label>Public Key (PEM, RS256)</Label>
                <Textarea
                  rows={5}
                  value={publicKey}
                  onChange={(e)=>setPublicKey(e.target.value)}
                  placeholder={`-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----`}
                  className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={doVerify}><FileJson className="mr-2 h-4 w-4" /> Verify</Button>
          </div>
          {verifyResult.msg && <p className="text-sm">{verifyResult.msg}</p>}
        </div>
      </div>
    </div>
  )
}
