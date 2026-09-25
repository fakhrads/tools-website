'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link2, Copy, Check, Plus, Trash2, Globe, ExternalLink, X } from 'lucide-react'

type QueryParam = { id: string; key: string; value: string }

const DEFAULT_URL = 'https://deploy.fakhrads.dev:443/api/trpc/compose.one?composeId=rhCfJR8UHyFRJHasEysSV&branch=main&view=staging#logs'

export default function UrlParserPage() {
  const [urlInput, setUrlInput] = React.useState(DEFAULT_URL)
  const [protocol, setProtocol] = React.useState('')
  const [host, setHost] = React.useState('')
  const [port, setPort] = React.useState('')
  const [pathname, setPathname] = React.useState('')
  const [hash, setHash] = React.useState('')
  const [params, setParams] = React.useState<QueryParam[]>([])
  const [copied, setCopied] = React.useState(false)

  // Parse on input change
  const parseUrl = React.useCallback((str: string) => {
    try {
      if (!str.trim()) return
      let clean = str.trim()
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'https://' + clean
      }
      const u = new URL(clean)
      setProtocol(u.protocol)
      setHost(u.hostname)
      setPort(u.port || (u.protocol === 'https:' ? '443' : '80'))
      setPathname(u.pathname)
      setHash(u.hash.replace('#', ''))

      const pList: QueryParam[] = []
      u.searchParams.forEach((v, k) => {
        pList.push({ id: Math.random().toString(36).substring(2, 9), key: k, value: v })
      })
      setParams(pList)
    } catch (err) {
      // invalid URL
    }
  }, [])

  React.useEffect(() => {
    parseUrl(urlInput)
  }, [urlInput, parseUrl])

  // Rebuild URL when fields change
  const buildUrl = () => {
    try {
      const u = new URL(`${protocol}//${host}${port && port !== '80' && port !== '443' ? `:${port}` : ''}${pathname || '/'}`)
      params.forEach(p => {
        if (p.key) u.searchParams.set(p.key, p.value)
      })
      if (hash) u.hash = hash
      return u.toString()
    } catch {
      return urlInput
    }
  }

  const handleParamChange = (id: string, field: 'key' | 'value', val: string) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p))
  }

  const addParam = () => {
    setParams(prev => [...prev, { id: Math.random().toString(36).substring(2, 9), key: '', value: '' }])
  }

  const removeParam = (id: string) => {
    setParams(prev => prev.filter(p => p.id !== id))
  }

  const copyUrl = async () => {
    const full = buildUrl()
    await navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">URL Parser & Query Builder</h1>
            <p className="text-sm text-muted-foreground">Deconstruct, inspect, edit query params, and rebuild complex web URLs.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => window.open(buildUrl(), '_blank')}>
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open
          </Button>
          <Button size="sm" variant="default" onClick={copyUrl}>
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-300" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            Copy Built URL
          </Button>
        </div>
      </div>

      {/* URL Input Bar */}
      <div className="rounded-2xl border border-border/60 bg-card p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Raw URL Input</span>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setUrlInput(''); setParams([]); }}>
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        </div>
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste URL here..."
          className="font-mono text-sm"
        />
      </div>

      {/* URL Components */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/50 bg-card p-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Protocol</span>
          <Input
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="font-mono text-xs mt-1"
          />
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-3 md:col-span-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Host / Domain</span>
          <Input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="font-mono text-xs mt-1"
          />
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Port</span>
          <Input
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="font-mono text-xs mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/50 bg-card p-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Pathname</span>
          <Input
            value={pathname}
            onChange={(e) => setPathname(e.target.value)}
            className="font-mono text-xs mt-1"
          />
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Hash / Fragment</span>
          <Input
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="font-mono text-xs mt-1"
          />
        </div>
      </div>

      {/* Query Parameters Table */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Query Parameters</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              {params.length}
            </span>
          </div>
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addParam}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Parameter
          </Button>
        </div>

        <div className="p-4 flex flex-col gap-2.5">
          {params.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No query parameters present. Click "Add Parameter" to attach keys.
            </div>
          ) : (
            params.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <Input
                  value={p.key}
                  onChange={(e) => handleParamChange(p.id, 'key', e.target.value)}
                  placeholder="Key"
                  className="font-mono text-xs w-1/3"
                />
                <Input
                  value={p.value}
                  onChange={(e) => handleParamChange(p.id, 'value', e.target.value)}
                  placeholder="Value"
                  className="font-mono text-xs flex-1"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeParam(p.id)}
                  className="text-destructive hover:bg-destructive/10 h-9 w-9 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
