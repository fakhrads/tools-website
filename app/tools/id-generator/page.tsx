'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Download, RefreshCcw } from 'lucide-react'

function nanoid(size = 21, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_') {
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  const mask = (2 << Math.floor(Math.log2(alphabet.length - 1))) - 1
  let id = ''
  for (let i=0; id.length < size; i++) {
    const rnd = bytes[i % bytes.length] & mask
    if (rnd < alphabet.length) id += alphabet[rnd]
    if (i % bytes.length === bytes.length - 1) crypto.getRandomValues(bytes)
  }
  return id
}

const ULID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
function encodeBase32(num: number, len: number) {
  let out = ''
  for (let i = 0; i < len; i++) {
    out = ULID_ALPHABET[num % 32] + out
    num = Math.floor(num / 32)
  }
  return out
}
function ulid(now = Date.now()) {
  const time = now
  const timeStr = encodeBase32(Math.floor(time / 0x100000000), 6) + encodeBase32(time >>> 0, 4)
  let randStr = ''
  const bytes = new Uint8Array(10)
  crypto.getRandomValues(bytes)
  for (let i = 0; i < 10; i++) randStr += ULID_ALPHABET[bytes[i] % 32]
  return timeStr + randStr
}

export default function IdGeneratorPage() {
  const [mode, setMode] = React.useState<'uuid'|'ulid'|'nanoid'>('uuid')
  const [count, setCount] = React.useState<number>(20)
  const [size, setSize] = React.useState<number>(21)
  const [alphabet, setAlphabet] = React.useState<string>('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_')
  const [list, setList] = React.useState<string[]>([])

  const gen = () => {
    const out: string[] = []
    for (let i=0;i<count;i++){
      if (mode==='uuid') out.push(crypto.randomUUID())
      else if (mode==='ulid') out.push(ulid())
      else out.push(nanoid(size, alphabet))
    }
    setList(out)
  }

  React.useEffect(() => { gen() }, []) // initial

  const copyAll = async () => {
    await navigator.clipboard.writeText(list.join('\n'))
  }
  const downloadTxt = () => {
    const blob = new Blob([list.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${mode}.txt`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <section className="grid gap-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">UID / ULID / Nanoid Generator</h1>
        <Badge variant="outline">Client-side</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="grid gap-1">
              <Label>Mode</Label>
              <select title='Mode' className="border rounded h-10 px-3" value={mode} onChange={(e)=>setMode(e.target.value as any)}>
                <option value="uuid">UUID v4</option>
                <option value="ulid">ULID</option>
                <option value="nanoid">Nanoid</option>
              </select>
            </div>
            <div className="grid gap-1">
              <Label>Count</Label>
              <Input type="number" min={1} max={1000} value={count} onChange={(e)=>setCount(Math.max(1, Math.min(1000, Number(e.target.value||1))))} />
            </div>
            {mode==='nanoid' ? (
              <div className="grid gap-1">
                <Label>Size</Label>
                <Input type="number" min={1} max={100} value={size} onChange={(e)=>setSize(Math.max(1, Math.min(100, Number(e.target.value||21))))} />
              </div>
            ) : <div />}
          </div>

          {mode==='nanoid' && (
            <div className="grid gap-1">
              <Label>Alphabet</Label>
              <Input value={alphabet} onChange={(e)=>setAlphabet(e.target.value||'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_')} />
              <div className="text-xs text-muted-foreground">Default url-safe: A–Z a–z 0–9 - _</div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={gen}><RefreshCcw className="mr-2 h-4 w-4" /> Generate</Button>
            <Button variant="secondary" onClick={copyAll}><Copy className="mr-2 h-4 w-4" /> Copy</Button>
            <Button variant="outline" onClick={downloadTxt}><Download className="mr-2 h-4 w-4" /> Download</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80 rounded border p-2">
            <pre className="text-xs">{list.join('\n')}</pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  )
}
