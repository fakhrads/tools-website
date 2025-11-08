'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Wand2,
  FileJson,
  Braces,
  Star,
  StarOff,
  ExternalLink,
  Info,
  Regex,
  Hash,
  ShieldCheck,
  Binary,
  Clock,
  Palette,
} from 'lucide-react'

type Tool = {
  id: string
  title: string
  desc: string
  href?: string
  icon?: React.ReactNode
  status?: 'New' | 'Beta' | 'Ready' | 'Soon'
  category: 'Studio' | 'Utilities' | 'Converters'
  tags?: string[]
  version?: string
  updatedAt?: string
}

const TOOLS: Tool[] = [
  {
    id: 'prettier',
    title: 'Code Prettier',
    desc: 'Format cepat dengan opsi semicolon, single quote, tab width.',
    href: '/tools/prettier',
    icon: <Wand2 className="h-4 w-4" />,
    status: 'New',
    category: 'Studio',
    tags: ['format', 'code'],
    version: '1.0',
    updatedAt: '2025-11-06',
  },
  {
    id: 'jsonlint',
    title: 'JSON Lint',
    desc: 'Validasi JSON + pretty print, error jelas.',
    href: '/tools/json-lint',
    icon: <FileJson className="h-4 w-4" />,
    status: 'Ready',
    category: 'Studio',
    tags: ['json', 'lint'],
    version: '1.2',
    updatedAt: '2025-11-05',
  },
  {
    id: 'regex',
    title: 'Regex Tester',
    desc: 'Uji regex dengan flags dan highlight match.',
    href: '/tools/regex',
    icon: <Regex className="h-4 w-4" />,
    status: 'Ready',
    category: 'Utilities',
    tags: ['regex', 'test'],
    version: '1.0',
    updatedAt: '2025-11-06',
  },
  {
    id: 'uuid',
    title: 'UUID Generator',
    desc: 'Generate UUID v4/v7, copy cepat, batch mode.',
    href: '/tools/uuid',
    icon: <Hash className="h-4 w-4" />,
    status: 'Ready',
    category: 'Utilities',
    tags: ['uuid', 'id'],
    version: '1.0',
  },
  {
    id: 'jwt',
    title: 'JWT Decoder',
    desc: 'Decode header & payload (tanpa kirim ke server).',
    href: '/tools/jwt',
    icon: <ShieldCheck className="h-4 w-4" />,
    status: 'Beta',
    category: 'Utilities',
    tags: ['jwt', 'auth'],
    version: '0.9',
  },
  {
    id: 'base64',
    title: 'Base64 <→ Text',
    desc: 'Encode/decode Base64, URL-safe, file to Base64.',
    href: '/tools/base64',
    icon: <Binary className="h-4 w-4" />,
    status: 'Ready',
    category: 'Converters',
    tags: ['encode', 'decode'],
    version: '1.0',
  },
  {
    id: 'timestamp',
    title: 'Timestamp Converter',
    desc: 'Unix ↔ Date, zona waktu & format ISO.',
    href: '/tools/timestamp',
    icon: <Clock className="h-4 w-4" />,
    status: 'Ready',
    category: 'Converters',
    tags: ['time', 'date'],
    version: '1.0',
  },
  {
    id: 'color',
    title: 'Color Picker',
    desc: 'HEX/RGB/HSL, konversi & clipboard cepat.',
    href: '/tools/color',
    icon: <Palette className="h-4 w-4" />,
    status: 'Beta',
    category: 'Utilities',
    tags: ['color', 'design'],
    version: '0.8',
  },
  {
    id: 'csv2json',
    title: 'CSV → JSON',
    desc: 'Ubah CSV menjadi JSON dengan opsi header & delimiter.',
    icon: <Braces className="h-4 w-4" />,
    status: 'Soon',
    category: 'Converters',
    tags: ['csv', 'convert'],
    version: '0.1',
  },
]

const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ')
const relTime = (iso?: string) => {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (d <= 0) return 'updated today'
  if (d === 1) return 'updated 1 day ago'
  if (d < 30) return `updated ${d} days ago`
  const m = Math.floor(d / 30)
  return `updated ${m} mo ago`
}

export default function ToolsOverview() {
  const [favs, setFavs] = React.useState<string[]>(
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tools_fav') || '[]') : []
  )
  React.useEffect(() => {
    try {
      localStorage.setItem('tools_fav', JSON.stringify(favs))
    } catch {}
  }, [favs])
  const toggleFav = (id: string) =>
    setFavs((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]))

  return (
    <div className="grid gap-6">
      <h2 className="text-base font-semibold text-foreground">All tools</h2>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 items-stretch">
        {TOOLS.map((t) => (
          <ToolCard key={t.id} tool={t} isFav={favs.includes(t.id)} onFav={toggleFav} />
        ))}
      </div>
    </div>
  )
}

function ToolCard({
  tool,
  isFav,
  onFav,
}: {
  tool: Tool
  isFav: boolean
  onFav: (id: string) => void
}) {
  const disabled = !tool.href || tool.status === 'Soon'

  return (
    <Card
      className={cx(
        'h-full flex flex-col rounded-2xl border border-border shadow-sm transition-all bg-card text-card-foreground',
        !disabled && 'hover:shadow-md hover:-translate-y-0.5'
      )}
    >
      <CardContent className="flex flex-col p-4">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            {tool.status && (
              <Badge
                variant={
                  tool.status === 'New' ? 'secondary' : tool.status === 'Beta' ? 'outline' : 'secondary'
                }
                className={tool.status === 'Ready' ? 'bg-foreground text-background' : ''}
              >
                {tool.status}
              </Badge>
            )}
            {tool.version && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                v{tool.version}
              </span>
            )}
            {tool.updatedAt && (
              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                <Info className="h-3.5 w-3.5" /> {relTime(tool.updatedAt)}
              </span>
            )}
          </div>

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 border-border"
            onClick={() => onFav(tool.id)}
            title={isFav ? 'Unpin' : 'Pin'}
          >
            {isFav ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-3 min-h-[48px]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted ring-1 ring-border">
            {tool.icon || <Braces className="h-4 w-4" />}
          </span>
          <div className="text-sm font-semibold leading-tight">{tool.title}</div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground min-h-[56px]">{tool.desc}</p>

        {tool.tags?.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tool.tags.map((tg) => (
              <span
                key={tg}
                className="text-[11px] px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground"
              >
                {tg}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="mt-auto border-t border-border px-4 py-3">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">{tool.category}</div>

            {disabled ? (
              <Button size="sm" variant="secondary" disabled>
                Open <ExternalLink className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button asChild size="sm" variant="secondary" className="group">
                <Link href={tool.href!} aria-label={`Open ${tool.title}`}>
                  Open <ExternalLink className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            )}
          </div>

          <div className={cx('mt-2', disabled ? '' : 'opacity-0 pointer-events-none')}>
            <div className="rounded-md bg-muted border border-border text-xs text-muted-foreground px-2 py-2">
              Coming soon
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
