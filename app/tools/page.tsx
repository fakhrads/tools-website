'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wand2, FileJson, Braces, Star, StarOff, ExternalLink, Info } from 'lucide-react'

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
  React.useEffect(() => { try { localStorage.setItem('tools_fav', JSON.stringify(favs)) } catch {} }, [favs])
  const toggleFav = (id: string) => setFavs((xs) => xs.includes(id) ? xs.filter(x => x !== id) : [...xs, id])

  return (
    <div className="grid gap-6">
      <h2 className="text-base font-semibold">All tools</h2>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 items-stretch">
        {TOOLS.map((t) => (
          <ToolCard key={t.id} tool={t} isFav={favs.includes(t.id)} onFav={toggleFav} />
        ))}
      </div>
    </div>
  )
}

function ToolCard({
  tool, isFav, onFav,
}: { tool: Tool; isFav: boolean; onFav: (id: string) => void }) {
  const disabled = !tool.href || tool.status === 'Soon'

  return (
    <Card
      className={cx(
        'h-full flex flex-col rounded-2xl border border-slate-200/70 shadow-sm transition-all',
        !disabled && 'hover:shadow-md hover:-translate-y-0.5'
      )}
    >
      {/* CONTENT */}
      <CardContent className="flex flex-col p-4">
        {/* Utility bar (no absolute) */}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            {tool.status && (
              <Badge
                variant={tool.status === 'New' ? 'secondary' : tool.status === 'Beta' ? 'outline' : 'secondary'}
                className={tool.status === 'Ready' ? 'bg-slate-900 text-white' : ''}
              >
                {tool.status}
              </Badge>
            )}
            {tool.version && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-50 border text-slate-600">
                v{tool.version}
              </span>
            )}
            {tool.updatedAt && (
              <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                <Info className="h-3.5 w-3.5" /> {relTime(tool.updatedAt)}
              </span>
            )}
          </div>

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => onFav(tool.id)}
            title={isFav ? 'Unpin' : 'Pin'}
          >
            {isFav ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
          </Button>
        </div>

        {/* Header row */}
        <div className="mt-3 flex items-center gap-3 min-h-[48px]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200">
            {tool.icon || <Braces className="h-4 w-4" />}
          </span>
          <div className="text-sm font-semibold leading-tight">{tool.title}</div>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-slate-600 min-h-[56px]">{tool.desc}</p>

        {/* Tags */}
        {tool.tags?.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tool.tags.map((tg) => (
              <span key={tg} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-50 border text-slate-600">{tg}</span>
            ))}
          </div>
        ) : null}
      </CardContent>

      {/* FOOTER (link button ada di sini) */}
      <CardFooter className="mt-auto border-t px-4 py-3">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">{tool.category}</div>

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

          {/* Reserve slot untuk banner agar tinggi footer konsisten */}
          <div className={cx('mt-2', disabled ? '' : 'opacity-0 pointer-events-none')}>
            <div className="rounded-md bg-slate-50 border text-xs text-slate-500 px-2 py-2">
              Coming soon
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
