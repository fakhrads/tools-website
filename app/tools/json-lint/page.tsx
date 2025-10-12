'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { FileJson, Play, Copy, Check } from 'lucide-react'

export default function JsonLintPage() {
  return (
    <Card className="border border-slate-200/80 rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileJson className="h-4 w-4" />
          <CardTitle className="text-base font-semibold">JSON Lint</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <JsonLintTool />
      </CardContent>
    </Card>
  )
}

function JsonLintTool() {
  const [input, setInput] = React.useState<string>('{\n  "hello": "world"\n}')
  const [output, setOutput] = React.useState<string>('')
  const [error, setError] = React.useState<string>('')

  const lint = React.useCallback(() => {
    try {
      const obj = JSON.parse(input)
      const pretty = JSON.stringify(obj, null, 2)
      setOutput(pretty)
      setError('')
    } catch (e: any) {
      setError(e?.message || String(e))
      setOutput('')
    }
  }, [input])

  const [copied, setCopied] = React.useState(false)
  const copyOut = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="grid gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="json-in">JSON Input</Label>
          <Textarea id="json-in" className="min-h-[240px]" value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="json-out">Output</Label>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={copyOut}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button size="sm" onClick={lint}>
                <Play className="h-4 w-4 mr-1" /> Lint
              </Button>
            </div>
          </div>
          <Textarea id="json-out" className="min-h-[240px] font-mono" value={output} readOnly />
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Error: {error}
        </div>
      )}
      <Separator />
    </div>
  )
}
