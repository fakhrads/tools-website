'use client'

import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Database, Copy, Check, Minimize2, Maximize2, X } from 'lucide-react'

// Simple robust SQL formatter
function formatSql(sql: string, uppercaseWords: boolean = true): string {
  if (!sql.trim()) return ''

  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING',
    'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
    'CROSS JOIN', 'ON', 'AS', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
    'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'UNION', 'UNION ALL', 'CASE', 'WHEN',
    'THEN', 'ELSE', 'END', 'WITH', 'DISTINCT', 'IN', 'NOT IN', 'EXISTS', 'NOT EXISTS',
    'IS NULL', 'IS NOT NULL', 'BETWEEN', 'LIKE', 'ILIKE'
  ]

  let formatted = sql
    .replace(/\s+/g, ' ')
    .trim()

  // Keyword casing
  keywords.forEach(kw => {
    const reg = new RegExp(`\\b${kw}\\b`, 'gi')
    formatted = formatted.replace(reg, uppercaseWords ? kw.toUpperCase() : kw.toLowerCase())
  })

  // Add newlines before major query clauses
  const newlineKeywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING',
    'LIMIT', 'OFFSET', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
    'CROSS JOIN', 'JOIN', 'SET', 'VALUES'
  ]

  newlineKeywords.forEach(kw => {
    const reg = new RegExp(`\\s+(${kw})\\b`, 'gi')
    formatted = formatted.replace(reg, '\n$1')
  })

  // Format comma separated items on SELECT
  const lines = formatted.split('\n')
  const indentedLines = lines.map(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('AND') || trimmed.startsWith('OR') || trimmed.startsWith('ON')) {
      return '    ' + trimmed
    }
    if (trimmed.startsWith('LEFT JOIN') || trimmed.startsWith('INNER JOIN') || trimmed.startsWith('JOIN') || trimmed.startsWith('RIGHT JOIN')) {
      return '  ' + trimmed
    }
    return trimmed
  })

  return indentedLines.join('\n')
}

function minifySql(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '') // strip comments
    .replace(/\s+/g, ' ')
    .trim()
}

const DEFAULT_SQL = `SELECT u.id, u.email, u.name, r.key as role_key, count(o.id) as order_count, sum(o.gross_sales) as total_revenue FROM core_users u LEFT JOIN core_user_roles ur ON u.id = ur.user_id LEFT JOIN core_roles r ON ur.role_id = r.id LEFT JOIN pos_orders o ON u.id = o.user_id WHERE u.is_active = true AND u.tenant_id = 'a07e1c14-6160-4ff9-9407-1593893f8724' GROUP BY u.id, u.email, u.name, r.key HAVING count(o.id) > 0 ORDER BY total_revenue DESC LIMIT 20;`

export default function SqlFormatterPage() {
  const [input, setInput] = React.useState(DEFAULT_SQL)
  const [output, setOutput] = React.useState('')
  const [uppercase, setUppercase] = React.useState(true)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    setOutput(formatSql(input, uppercase))
  }, [input, uppercase])

  const handleMinify = () => {
    setOutput(minifySql(input))
  }

  const handleFormat = () => {
    setOutput(formatSql(input, uppercase))
  }

  const copyResult = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SQL Formatter & Beautifier</h1>
            <p className="text-sm text-muted-foreground">Format, indent, standardize keywords, or minify raw SQL queries.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={uppercase ? "default" : "outline"}
            onClick={() => setUppercase(!uppercase)}
          >
            Uppercase Keywords: {uppercase ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Raw Query */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
            <span className="text-sm font-medium">Raw SQL Input</span>
            <Button size="sm" variant="ghost" onClick={() => setInput('')}>
              <X className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          </div>
          <div className="p-4 flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste raw SQL here..."
              rows={12}
              className="font-mono text-xs resize-y h-full min-h-[260px]"
            />
          </div>
          <div className="px-4 py-2.5 border-t border-border/40 bg-muted/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{input.length} chars</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleMinify}>
                <Minimize2 className="h-3.5 w-3.5 mr-1.5" /> Minify
              </Button>
              <Button size="sm" variant="default" onClick={handleFormat}>
                <Maximize2 className="h-3.5 w-3.5 mr-1.5" /> Format SQL
              </Button>
            </div>
          </div>
        </div>

        {/* Formatted Query */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
            <span className="text-sm font-medium">Formatted Output</span>
            <Button size="sm" variant="ghost" onClick={copyResult} disabled={!output}>
              {copied ? <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              Copy
            </Button>
          </div>
          <div className="p-4 flex-1">
            <Textarea
              readOnly
              value={output}
              rows={12}
              className="font-mono text-xs resize-y h-full min-h-[260px] bg-muted/20"
            />
          </div>
          <div className="px-4 py-2.5 border-t border-border/40 bg-muted/20 text-xs text-muted-foreground">
            {output.split('\n').length} lines · {output.length} characters
          </div>
        </div>
      </div>
    </div>
  )
}
