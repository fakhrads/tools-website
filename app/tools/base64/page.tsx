'use client'

import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Binary, Copy, Check, ArrowDownUp, X } from 'lucide-react'

type Mode = 'base64' | 'url' | 'hex'

export default function Base64Page() {
  const [mode, setMode] = React.useState<Mode>('base64')
  const [action, setAction] = React.useState<'encode' | 'decode'>('encode')
  const [input, setInput] = React.useState('Welcome to tools.fakhrads.dev!')
  const [copied, setCopied] = React.useState(false)

  const output = React.useMemo(() => {
    if (!input) return ''
    try {
      if (mode === 'base64') {
        if (action === 'encode') {
          return btoa(unescape(encodeURIComponent(input)))
        } else {
          return decodeURIComponent(escape(atob(input)))
        }
      } else if (mode === 'url') {
        if (action === 'encode') {
          return encodeURIComponent(input)
        } else {
          return decodeURIComponent(input)
        }
      } else if (mode === 'hex') {
        if (action === 'encode') {
          const bytes = new TextEncoder().encode(input)
          return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ')
        } else {
          const clean = input.replace(/[^0-9a-fA-F]/g, '')
          const bytes = new Uint8Array(clean.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [])
          return new TextDecoder().decode(bytes)
        }
      }
      return ''
    } catch (err: any) {
      return `[Error: ${err?.message || 'Invalid format for decoding'}]`
    }
  }, [input, mode, action])

  const copyResult = async () => {
    if (!output || output.startsWith('[Error')) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const swap = () => {
    if (output && !output.startsWith('[Error')) {
      setInput(output)
      setAction(action === 'encode' ? 'decode' : 'encode')
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
            <Binary className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Base64 & URL Encoder/Decoder</h1>
            <p className="text-sm text-muted-foreground">Convert text to and from Base64, URL-encoded string, or Hex format.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/50">
          {(['base64', 'url', 'hex'] as Mode[]).map((m) => (
            <Button
              key={m}
              size="sm"
              variant={mode === m ? 'default' : 'ghost'}
              className="h-8 px-3 text-xs uppercase"
              onClick={() => setMode(m)}
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Card */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Input Text</span>
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold uppercase">
                {action === 'encode' ? 'Plain' : mode}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => setInput('')}>
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            </div>
          </div>
          <div className="p-4 flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to convert..."
              rows={8}
              className="font-mono text-sm resize-y h-full min-h-[160px]"
            />
          </div>
          <div className="px-4 py-2.5 border-t border-border/40 bg-muted/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{input.length} characters</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={action === 'encode' ? 'default' : 'outline'}
                onClick={() => setAction('encode')}
              >
                Encode
              </Button>
              <Button
                size="sm"
                variant={action === 'decode' ? 'default' : 'outline'}
                onClick={() => setAction('decode')}
              >
                Decode
              </Button>
            </div>
          </div>
        </div>

        {/* Output Card */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Output Result</span>
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold uppercase">
                {action === 'encode' ? mode : 'Plain'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={swap} title="Swap input and output">
                <ArrowDownUp className="h-3.5 w-3.5 mr-1" /> Swap
              </Button>
              <Button size="sm" variant="ghost" onClick={copyResult} disabled={!output || output.startsWith('[Error')}>
                {copied ? <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                Copy
              </Button>
            </div>
          </div>
          <div className="p-4 flex-1">
            <Textarea
              readOnly
              value={output}
              rows={8}
              className="font-mono text-sm resize-y h-full min-h-[160px] bg-muted/20"
            />
          </div>
          <div className="px-4 py-2.5 border-t border-border/40 bg-muted/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {output.startsWith('[Error') ? 'Formatting error' : `${output.length} characters`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
