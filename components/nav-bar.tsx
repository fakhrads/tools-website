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
import { ModeToggle } from './theme-toggle'

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

type TopLink = { href: string; label: string; badge?: string; external?: boolean }

const SECONDARY_LINKS: ReadonlyArray<TopLink> = [
  { href: '/', label: 'Home' },
  { href: '/tools', label: 'Tools', badge: 'New' },
  { href: '/docs', label: 'Docs' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/about', label: 'About', external: false },
]

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-3 group" aria-label="DevTools Studio Home">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity bg-gradient-to-br from-purple-600 to-blue-600 dark:from-violet-500 dark:to-sky-500" />
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105 bg-gradient-to-br from-purple-600 to-blue-600 dark:from-violet-500 dark:to-sky-500">
                <Hammer className="h-5 w-5" />
              </span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                DevTools Studio
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Lightning-fast tools for developers
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-3">
            <div className="relative group">
              <Input
                placeholder="Search…"
                className="w-72 pl-9 pr-16 h-9 bg-muted/50 focus:bg-background border-border focus-visible:ring-violet-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors" />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border hover:bg-muted/60 transition-all hover:shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Feedback
            </Button>

            <Button asChild variant="ghost" size="icon" className="hover:bg-muted">
              <a
                href="https://github.com/fakhrads/tools-website"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <ModeToggle />
          </div>

          <div className="lg:hidden">
            <MobileSheet open={open} setOpen={setOpen} links={links} pathname={pathname ?? '/'} />
          </div>
        </div>

        <div className="hidden md:block">
          <nav className="flex items-center gap-2 h-11">
            {links.map((l) => {
              const active = isActive(l.href)
              const base = 'relative inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all'
              return l.external ? (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    base,
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
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
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 dark:from-violet-500 dark:to-sky-500" />
                  )}
                </a>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    base,
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
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
                      <span className="absolute inset-0 rounded-lg border border-border/60 bg-muted/40" />
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 dark:from-violet-500 dark:to-sky-500" />
                    </>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

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
                        ? 'text-white border-transparent shadow-md bg-gradient-to-r from-purple-600 to-blue-600 dark:from-violet-500 dark:to-sky-500'
                        : 'bg-background text-foreground border-border hover:border-border/80 hover:shadow-sm'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {l.label}
                    {l.badge && (
                      <Badge
                        variant={active ? 'secondary' : 'outline'}
                        className={cn('text-[10px] font-semibold', active ? 'bg-white/20 text-white border-white/30' : '')}
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
          className="h-9 w-9 hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] sm:w-[380px] p-0">
        <SheetHeader className="px-6 py-4 border-b border-border bg-gradient-to-br from-muted to-background">
          <SheetTitle className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br from-purple-600 to-blue-600 dark:from-violet-500 dark:to-sky-500">
              <Hammer className="h-4 w-4" />
            </span>
            <div className="text-left">
              <div className="font-bold text-foreground">Web Tools Studio</div>
              <div className="text-xs font-normal text-muted-foreground">Developer Tools</div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="p-6 space-y-6">
          <div className="relative">
            <Input
              placeholder="Search…"
              className="pl-9 border-border focus-visible:ring-violet-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
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
                      ? 'text-white shadow-md bg-gradient-to-r from-purple-600 to-blue-600 dark:from-violet-500 dark:to-sky-500'
                      : 'text-foreground hover:bg-muted'
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

          <Button className="w-full gap-2 shadow-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-violet-500 dark:to-sky-500 dark:hover:from-violet-600 dark:hover:to-sky-600">
            <Sparkles className="h-4 w-4" />
            Send Feedback
          </Button>

          <div className="flex justify-center">
            <Button asChild variant="ghost" size="icon" className="hover:bg-muted">
              <a
                href="https://github.com/fakhrads/tools-website"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
