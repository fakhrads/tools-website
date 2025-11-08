'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
        ? <Badge variant="destructive"><AlertTriangle className="h-3.5 w-3.5 mr-1" /> expired</Badge>
        : <Badge variant="outline">exp: {fmtDate(exp.date)}</Badge>)}
      {nbf && (nbf.date.getTime() > now
        ? <Badge variant="destructive">nbf: {fmtDate(nbf.date)} (not yet valid)</Badge>
        : <Badge variant="outline">nbf: {fmtDate(nbf.date)}</Badge>)}
      {iat && <Badge variant="outline">iat: {fmtDate(iat.date)}</Badge>}
      {!decoded?.signatureB64u && <Badge variant="destructive">unsigned (no signature)</Badge>}
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
    <section className="grid gap-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5" />
        <h1 className="text-xl font-semibold">JWT Decoder</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Textarea rows={5} placeholder="tempelkan JWT di sini (header.payload.signature)" value={token} onChange={(e) => setToken(e.target.value)} />
          <div className="text-xs text-muted-foreground">
            Token tidak dikirim ke server—decode dilakukan di browser.
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Header</CardTitle>
            <Badge variant="outline">{hdr.alg ? `alg: ${hdr.alg}` : 'no alg'}</Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-60 rounded border p-3">
              <pre className="text-xs">{JSON.stringify(hdr, null, 2)}</pre>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Payload</CardTitle>
            <Button variant="outline" onClick={copyDecoded}><Copy className="mr-2 h-4 w-4" /> Copy JSON</Button>
          </CardHeader>
          <CardContent className="grid gap-2">
            {statusBadges}
            <ScrollArea className="h-60 rounded border p-3">
              <pre className="text-xs">{JSON.stringify(pay, null, 2)}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Verify Signature (opsional)</CardTitle>
          <Badge variant={verifyResult.ok === null ? 'outline' : verifyResult.ok ? 'default' : 'destructive'}>
            {verifyResult.ok === null ? 'idle' : verifyResult.ok ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> valid</> : <><AlertTriangle className="h-3.5 w-3.5 mr-1" /> invalid</>}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label>Algoritma</Label>
              <Input list="alg-list" value={alg} onChange={(e) => setAlg(e.target.value)} />
              <datalist id="alg-list">
                <option value="auto" />
                <option value="HS256" />
                <option value="RS256" />
              </datalist>
              <p className="text-xs text-muted-foreground">auto: mengikuti header.alg</p>
            </div>
            { (alg === 'HS256' || (alg === 'auto' && decoded?.alg === 'HS256')) && (
              <div className="grid gap-1">
                <Label><Key className="inline h-3.5 w-3.5 mr-1" /> Secret (HS256)</Label>
                <Input type="password" value={secret} onChange={(e)=>setSecret(e.target.value)} placeholder="shared secret" />
              </div>
            )}
            { (alg === 'RS256' || (alg === 'auto' && decoded?.alg === 'RS256')) && (
              <div className="grid gap-1 md:col-span-2">
                <Label>Public Key (PEM, RS256)</Label>
                <Textarea rows={5} value={publicKey} onChange={(e)=>setPublicKey(e.target.value)} placeholder={`-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----`} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={doVerify}><FileJson className="mr-2 h-4 w-4" /> Verify</Button>
          </div>
          {verifyResult.msg && <p className="text-sm">{verifyResult.msg}</p>}
        </CardContent>
      </Card>
    </section>
  )
}
