'use client'

import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FileText, Copy, Check, Eye, Code, Download, X } from 'lucide-react'

// Simple robust markdown parser to HTML for browser preview
function parseMarkdown(md: string): string {
  let html = md
    // Escape HTML special chars
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Code blocks ```code```
  html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="bg-muted p-3 rounded-lg overflow-x-auto my-2 text-xs font-mono border border-border/50"><code>${code.trim()}</code></pre>`
  })

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">$1</code>')

  // Headers # H1, ## H2, ### H3
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold mt-4 mb-1 text-foreground">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mt-5 mb-2 pb-1 border-b border-border/50 text-foreground">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black mt-6 mb-3 pb-2 border-b border-border text-foreground">$1</h1>')

  // Blockquotes > quote
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-3 py-1 my-2 italic text-muted-foreground bg-muted/20 rounded-r">$1</blockquote>')

  // Bold **bold**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
  // Italic *italic*
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')

  // Unordered list - item
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-sm text-foreground/90">$1</li>')

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:opacity-80">$1</a>')

  // Paragraphs
  html = html.split('\n\n').map(p => {
    p = p.trim()
    if (!p) return ''
    if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<blockquote') || p.startsWith('<li')) {
      return p
    }
    return `<p class="mb-3 leading-relaxed text-sm text-foreground/90">${p.replace(/\n/g, '<br/>')}</p>`
  }).join('\n')

  return html
}

const DEFAULT_MD = `# 🚀 Markdown Live Previewer

Selamat datang di **tools.fakhrads.dev**! Editor markdown interaktif instan di browser.

## Fitur Utama
- Realtime rendering tanpa server lag
- Export ke **HTML** murni atau download file .md
- Syntax highlighting untuk \`inline code\` dan blok kode

### Contoh Blok Kode:
\`\`\`typescript
interface User {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'guest';
}
\`\`\`

> *"Code is poetry written with logic."*

Kunjungi repositori di [0xPortal GitHub](https://github.com/fakhrads/0xPortal).
`

export default function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = React.useState(DEFAULT_MD)
  const [tab, setTab] = React.useState<'preview' | 'html'>('preview')
  const [copied, setCopied] = React.useState(false)

  const htmlOutput = React.useMemo(() => parseMarkdown(markdown), [markdown])

  const copyHTML = async () => {
    await navigator.clipboard.writeText(htmlOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const downloadFile = (type: 'md' | 'html') => {
    const content = type === 'md' ? markdown : htmlOutput
    const blob = new Blob([content], { type: type === 'md' ? 'text/markdown' : 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document.${type}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Markdown Live Preview</h1>
            <p className="text-sm text-muted-foreground">Type or paste Markdown text with real-time formatted preview and HTML export.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => downloadFile('md')}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> .MD
          </Button>
          <Button size="sm" variant="outline" onClick={() => downloadFile('html')}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> .HTML
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor Box */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Code className="h-4 w-4 text-muted-foreground" /> Markdown Source
            </span>
            <Button size="sm" variant="ghost" onClick={() => setMarkdown('')}>
              <X className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          </div>
          <div className="p-4 flex-1">
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Type Markdown content here..."
              rows={16}
              className="font-mono text-sm resize-y h-full min-h-[300px]"
            />
          </div>
          <div className="px-4 py-2 border-t border-border/40 bg-muted/20 text-xs text-muted-foreground">
            {markdown.split(/\s+/).filter(Boolean).length} words · {markdown.length} characters
          </div>
        </div>

        {/* Preview / HTML Box */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-1.5 bg-muted/50 p-0.5 rounded-lg border border-border/50">
              <Button
                size="sm"
                variant={tab === 'preview' ? 'default' : 'ghost'}
                className="h-7 text-xs px-2.5"
                onClick={() => setTab('preview')}
              >
                <Eye className="h-3 w-3 mr-1" /> Preview
              </Button>
              <Button
                size="sm"
                variant={tab === 'html' ? 'default' : 'ghost'}
                className="h-7 text-xs px-2.5"
                onClick={() => setTab('html')}
              >
                <Code className="h-3 w-3 mr-1" /> HTML Code
              </Button>
            </div>
            <Button size="sm" variant="ghost" onClick={copyHTML}>
              {copied ? <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              Copy HTML
            </Button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[480px]">
            {tab === 'preview' ? (
              <div
                className="prose dark:prose-invert max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            ) : (
              <pre className="font-mono text-xs bg-muted/30 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap border border-border/40">
                {htmlOutput}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
