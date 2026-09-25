'use client'

import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldCheck, Copy, Check, X, RefreshCw } from 'lucide-react'

// MD5 implementation in pure JS (Web Crypto doesn't support MD5 directly)
function md5(string: string): string {
  function md5cycle(x: any, k: any) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xFFFFFFFF;
  }

  const n = string.length;
  let state = [1732584193, -271733879, -1732584194, 271733878];
  let i: number;
  for (i = 64; i <= n; i += 64) {
    md5cycle(state, md5blk(string.substring(i - 64, i)));
  }
  string = string.substring(i - 64);
  let tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let j: number;
  for (j = 0; j < string.length; j++) tail[j >> 2] |= string.charCodeAt(j) << ((j % 4) << 3);
  tail[j >> 2] |= 0x80 << ((j % 4) << 3);
  if (j > 55) {
    md5cycle(state, tail);
    for (let k = 0; k < 16; k++) tail[k] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);
  const hexChars = "0123456789abcdef";
  let res = "";
  for (let k = 0; k < 4; k++) {
    for (let l = 0; l < 4; l++) {
      res += hexChars[(state[k] >> (l * 8 + 4)) & 0x0F] + hexChars[(state[k] >> (l * 8)) & 0x0F];
    }
  }
  return res;
}

function md5blk(s: string) {
  let md5blks: number[] = [];
  for (let i = 0; i < 64; i += 4) {
    md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
  }
  return md5blks;
}

async function subtleHash(algo: string, text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algo, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGeneratorPage() {
  const [input, setInput] = React.useState('Hello, 0xPortal & Tools!')
  const [uppercase, setUppercase] = React.useState(false)
  const [hashes, setHashes] = React.useState<{ [key: string]: string }>({})
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    const compute = async () => {
      try {
        const md5Val = input ? md5(input) : ''
        const sha1Val = input ? await subtleHash('SHA-1', input) : ''
        const sha256Val = input ? await subtleHash('SHA-256', input) : ''
        const sha384Val = input ? await subtleHash('SHA-384', input) : ''
        const sha512Val = input ? await subtleHash('SHA-512', input) : ''

        if (active) {
          setHashes({
            'MD5': md5Val,
            'SHA-1': sha1Val,
            'SHA-256': sha256Val,
            'SHA-384': sha384Val,
            'SHA-512': sha512Val,
          })
        }
      } catch (err) {
        console.error(err)
      }
    }
    compute()
    return () => { active = false }
  }, [input])

  const copyToClip = async (key: string, text: string) => {
    await navigator.clipboard.writeText(uppercase ? text.toUpperCase() : text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Hash Generator</h1>
            <p className="text-sm text-muted-foreground">Compute MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes instantly in-browser.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={uppercase ? "default" : "outline"}
            onClick={() => setUppercase(!uppercase)}
          >
            Uppercase: {uppercase ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-sm font-medium">Input String</span>
          <Button size="sm" variant="ghost" onClick={() => setInput('')}>
            <X className="h-3.5 w-3.5 mr-1.5" /> Clear
          </Button>
        </div>
        <div className="p-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste plain text to generate hashes..."
            rows={3}
            className="font-mono text-sm resize-y"
          />
        </div>
      </div>

      <div className="grid gap-3">
        {['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].map((algo) => {
          const val = hashes[algo] || ''
          const displayVal = uppercase ? val.toUpperCase() : val
          return (
            <div key={algo} className="rounded-2xl border border-border/60 bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="w-28 shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
                  {algo}
                </span>
              </div>
              <div className="flex-1 font-mono text-xs break-all bg-muted/40 p-2.5 rounded-lg border border-border/40 select-all">
                {displayVal || <span className="text-muted-foreground italic">Empty input</span>}
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={!val}
                onClick={() => copyToClip(algo, val)}
                className="shrink-0"
              >
                {copiedKey === algo ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                  </>
                )}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
