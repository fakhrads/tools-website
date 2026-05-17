import * as React from 'react'
import {
  Wand2, FileJson, Regex, Type, FileSpreadsheet, Globe, KeyRound,
  Timer, Clock, Fingerprint, Palette
} from 'lucide-react'

export type ToolItem = {
  id: string
  title: string
  href: string
  category: string
  icon: React.ReactNode
  keywords?: string[]
}

export const TOOLS: ToolItem[] = [
  { id: 'prettier',     title: 'Code Prettier',     href: '/tools/prettier',     category: 'Code',  icon: <Wand2 className="h-4 w-4" /> },
  { id: 'jsonlint',     title: 'JSON Lint',         href: '/tools/json-lint',    category: 'Data',  icon: <FileJson className="h-4 w-4" /> },
  { id: 'regex',        title: 'Regex Tester',      href: '/tools/regex',        category: 'Text',  icon: <Regex className="h-4 w-4" /> },
  { id: 'word-counter', title: 'Word Counter',      href: '/tools/word-counter', category: 'Text',  icon: <Type className="h-4 w-4" /> },
  { id: 'csv-json',     title: 'CSV → JSON',        href: '/tools/csv-to-json',  category: 'Data',  icon: <FileSpreadsheet className="h-4 w-4" /> },
  { id: 'http',         title: 'HTTP Requester',    href: '/tools/http',         category: 'HTTP',  icon: <Globe className="h-4 w-4" /> },
  { id: 'jwt',          title: 'JWT Decoder',       href: '/tools/jwt',          category: 'Auth',  icon: <KeyRound className="h-4 w-4" /> },
  { id: 'cron',         title: 'Cron Builder',      href: '/tools/cron',         category: 'Time',  icon: <Timer className="h-4 w-4" /> },
  { id: 'tz',           title: 'Time Zone Converter', href: '/tools/timezone',   category: 'Time',  icon: <Clock className="h-4 w-4" /> },
  { id: 'uid',          title: 'UID/ULID/Nanoid',   href: '/tools/uid',          category: 'ID',    icon: <Fingerprint className="h-4 w-4" /> },
  { id: 'color',        title: 'Color Picker',      href: '/tools/color-picker', category: 'Color', icon: <Palette className="h-4 w-4" /> },
]

export const CATEGORIES: string[] = Array.from(new Set(TOOLS.map(t => t.category))).sort()
