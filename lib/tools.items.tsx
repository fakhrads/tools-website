'use client'

import * as React from 'react'
import {
  House,
  Wand2,
  FileJson,
  Code,
  FingerprintIcon,
  DockIcon,
  Compass,
  Code2Icon,
  Clock10Icon,
  ShieldCheck,
  Clock,
  FlaskConical,
} from 'lucide-react'

export type Item = {
  href: string
  label: string
  icon: React.ReactNode
  category: 'Main' | 'Development' | 'Data' | 'Utilities' | 'Network' | 'Security'
  keywords?: string[]
}

export const ITEMS: Item[] = [
  { href: '/tools', label: 'All Tools', icon: <House className="h-4 w-4" />, category: 'Main', keywords: ['home','beranda','daftar'] },

  { href: '/tools/prettier', label: 'Code Prettier', icon: <Wand2 className="h-4 w-4" />, category: 'Development', keywords: ['format','prettier','beautify','kode'] },
  { href: '/tools/json-lint', label: 'JSON Linter', icon: <FileJson className="h-4 w-4" />, category: 'Data', keywords: ['validate','lint','parser'] },
  { href: '/tools/regex-tester', label: 'Regex Tester', icon: <Code className="h-4 w-4" />, category: 'Development', keywords: ['regex','pattern','test'] },
  { href: '/tools/id-generator', label: 'UUID Generator', icon: <FingerprintIcon className="h-4 w-4" />, category: 'Utilities', keywords: ['id','uuid','ulid','random'] },
  { href: '/tools/word-counter', label: 'Word Counter', icon: <DockIcon className="h-4 w-4" />, category: 'Utilities', keywords: ['kata','karakter','hitung'] },
  { href: '/tools/http-requester', label: 'HTTP Requester', icon: <Compass className="h-4 w-4" />, category: 'Network', keywords: ['rest','api','http','curl','client'] },
  { href: '/tools/csv-to-json', label: 'CSV to JSON', icon: <Code2Icon className="h-4 w-4" />, category: 'Data', keywords: ['convert','transform','parser'] },
  { href: '/tools/timezone-converter', label: 'Timezone Converter', icon: <Clock10Icon className="h-4 w-4" />, category: 'Utilities', keywords: ['time','zona','utc','offset'] },
  { href: '/tools/jwt-decoder', label: 'JWT Decoder', icon: <ShieldCheck className="h-4 w-4" />, category: 'Security', keywords: ['token','jwt','decode'] },
  { href: '/tools/cron-builder', label: 'Cron Builder', icon: <Clock className="h-4 w-4" />, category: 'Development', keywords: ['schedule','jadwal','crontab'] },

  { href: '/tools/color', label: 'Color Picker', icon: <FlaskConical className="h-4 w-4" />, category: 'Development', keywords: ['color','picker'] },

]

// urutan kategori
export const CATEGORY_ORDER: Item['category'][] = ['Main','Development','Data','Utilities','Network','Security']

export const CATEGORIES: Item['category'][] = CATEGORY_ORDER.filter(cat =>
  ITEMS.some(i => i.category === cat)
)

const INDEX = ITEMS.map(i => ({
  href: i.href,
  text: [
    i.label,
    i.href,
    i.category,
    ...(i.keywords ?? [])
  ].join(' ').toLowerCase()
}))

export const searchItems = (q: string): Item[] => {
  const k = q.trim().toLowerCase()
  if (!k) return ITEMS
  const match = new Set(INDEX.filter(x => x.text.includes(k)).map(x => x.href))
  return ITEMS.filter(i => match.has(i.href))
}

export const groupByCategory = (items: Item[]) => {
  const map = new Map<Item['category'], Item[]>()
  for (const it of items) {
    if (!map.has(it.category)) map.set(it.category, [])
    map.get(it.category)!.push(it)
  }
  for (const [key, arr] of map) {
    arr.sort((a,b) => a.label.localeCompare(b.label))
    map.set(key, arr)
  }
  return map
}
