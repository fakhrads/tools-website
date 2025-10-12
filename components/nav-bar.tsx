'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Hammer, Menu, Search, Sparkles, Command, Github } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

/** ==============================
 *  Types & Data
 *  ============================== */
type TopLink = { href: string; label: string; badge?: string; external?: boolean }

const SECONDARY_LINKS: ReadonlyArray<TopLink> = [
  { href: '/', label: 'Home' },
  { href: '/tools', label: 'Tools', badge: 'New' },
  { href: '/docs', label: 'Docs' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: 'https://github.com/your-org/devtools-studio', label: 'GitHub', external: true },
]

/** ==============================
 *  Component
 *  ============================== */
export function NavBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = useMemo(() => SECONDARY_LINKS, [])
  const isActive = (href: string) => {
    if (href.startsWith('http')) return false
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        {/* ================= Row 1: Header (Brand + Search + Actions) ================= */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="DevTools Studio Home">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                <Hammer className="h-5 w-5" />
              </span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                DevTools Studio
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Lightning-fast tools for developers
              </p>
            </div>
          </Link>

          {/* Desktop: Search + Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="relative group">
              <Input
                placeholder="Search…"
                className="w-72 pl-9 pr-16 h-9 border-slate-200 focus-visible:ring-purple-500 bg-slate-50/50 focus:bg-white transition-colors"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all hover:shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Feedback
            </Button>

            <Button asChild variant="ghost" size="icon" className="hover:bg-slate-100">
              <a
                href="https://github.com/your-org/devtools-studio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </Button>
          </div>

          {/* Mobile Trigger */}
          <div className="lg:hidden">
            <MobileSheet open={open} setOpen={setOpen} links={links} pathname={pathname ?? '/'} />
          </div>
        </div>

        {/* ================= Row 2: Secondary Nav (like Vercel) ================= */}
        <div className="hidden md:block">
          <nav className="flex items-center gap-2 h-11">
            {links.map((l) => {
              const active = isActive(l.href)
              const common =
                'relative inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all'
              return l.external ? (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    common,
                    active
                      ? 'text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  {l.label}
                  {l.badge && (
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-semibold">
                      {l.badge}
                    </Badge>
                  )}
                  <span className="sr-only">(opens in a new tab)</span>
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full" />
                  )}
                </a>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    common,
                    active
                      ? 'text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <span className="relative z-10">{l.label}</span>
                  {l.badge && (
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-semibold">
                      {l.badge}
                    </Badge>
                  )}
                  {active && (
                    <>
                      <span className="absolute inset-0 rounded-lg bg-purple-50/60 border border-purple-200/60" />
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full" />
                    </>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Mobile: chip-scroll secondary nav */}
        <div className="md:hidden py-2">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-center gap-2">
              {links.map((l) => {
                const active = isActive(l.href)
                const Comp: any = l.external ? 'a' : Link
                const props = l.external
                  ? { href: l.href, target: '_blank', rel: 'noopener noreferrer' }
                  : { href: l.href }
                return (
                  <Comp
                    key={l.href}
                    {...props}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium border transition-all',
                      active
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-md'
                        : 'text-slate-700 bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    )}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                    {l.badge && (
                      <Badge
                        variant={active ? 'secondary' : 'outline'}
                        className={cn(
                          'text-[10px] font-semibold',
                          active ? 'bg-white/20 text-white border-white/30' : ''
                        )}
                      >
                        {l.badge}
                      </Badge>
                    )}
                  </Comp>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </header>
  )
}

/** ==============================
 *  Mobile Sheet
 *  ============================== */
function MobileSheet({
  open,
  setOpen,
  links,
  pathname,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  links: ReadonlyArray<TopLink>
  pathname: string
}) {
  const isActive = (href: string) => {
    if (href.startsWith('http')) return false
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] sm:w-[380px] p-0">
        <SheetHeader className="px-6 py-4 border-b bg-gradient-to-br from-slate-50 to-white">
          <SheetTitle className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-md">
              <Hammer className="h-4 w-4" />
            </span>
            <div className="text-left">
              <div className="font-bold">DevTools Studio</div>
              <div className="text-xs font-normal text-slate-500">Developer Tools</div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search…"
              className="pl-9 border-slate-200 focus-visible:ring-purple-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          {/* Links */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              Navigation
            </p>
            {links.map((l) => {
              const active = isActive(l.href)
              const Comp: any = l.external ? 'a' : Link
              const props = l.external
                ? { href: l.href, target: '_blank', rel: 'noopener noreferrer' }
                : { href: l.href }
              return (
                <Comp
                  key={l.href}
                  {...props}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    active
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <span>{l.label}</span>
                  {l.badge && (
                    <Badge
                      variant={active ? 'secondary' : 'outline'}
                      className="text-[10px] font-semibold"
                    >
                      {l.badge}
                    </Badge>
                  )}
                </Comp>
              )
            })}
          </div>

          <Separator />

          {/* Feedback */}
          <Button className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md">
            <Sparkles className="h-4 w-4" />
            Send Feedback
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
