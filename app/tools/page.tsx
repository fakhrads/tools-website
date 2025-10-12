'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wand2, FileJson, Braces } from 'lucide-react'

export default function ToolsOverview() {
  const items = [
    {
      title: 'Prettier (JS/TS/JSON/MD/HTML/CSS)',
      desc: 'Format cepat dengan opsi semicolon, single quote, tab width.',
      href: '/tools/prettier',
      icon: <Wand2 className="h-4 w-4" />,
    },
    {
      title: 'JSON Lint',
      desc: 'Validasi JSON + pretty print, error jelas.',
      href: '/tools/json-lint',
      icon: <FileJson className="h-4 w-4" />,
      badge: 'Ready',
    },
  ]

  return (
    <div className="grid gap-6">
      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Studio</h2>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((it) => (
            <Link key={it.title} href={it.href}>
              <Card className="border border-slate-200/70 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
                        {it.icon || <Braces className="h-4 w-4" />}
                      </span>
                      {it.title}
                    </CardTitle>
                    {it.badge && <Badge variant="secondary">{it.badge}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-600 min-h-[40px]">{it.desc}</p>
                  <div className="mt-3">
                    <Button size="sm" variant="secondary">Open</Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
