'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Hammer, Home, Wrench, BookOpen, ScrollText, Info, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from './theme-toggle'

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  )
}

type NavLink = { href: string; label: string; icon: React.ReactNode }

const NAV_LINKS: ReadonlyArray<NavLink> = [
  { href: '/',           label: 'Home',      icon: <Home className="h-4 w-4" /> },
  { href: '/tools',      label: 'Tools',     icon: <Wrench className="h-4 w-4" /> },
  { href: '/docs',       label: 'Docs',      icon: <BookOpen className="h-4 w-4" /> },
  { href: '/changelog',  label: 'Changelog', icon: <ScrollText className="h-4 w-4" /> },
  { href: '/about',      label: 'About',     icon: <Info className="h-4 w-4" /> },
]

export function NavBar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* ── Desktop floating navbar ── */}
      <div className="fixed top-4 inset-x-0 z-50 hidden md:flex justify-center px-4 pointer-events-none">
        <header className="pointer-events-auto flex items-center w-full max-w-6xl gap-3 rounded-2xl border border-border/70 bg-background/80 backdrop-blur-2xl shadow-xl shadow-black/[0.06] dark:shadow-black/30 px-3 py-2">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0 mr-1"
            aria-label="DevTools Studio"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity bg-gradient-to-br from-indigo-500 to-violet-600" />
              <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br from-indigo-500 to-violet-600 group-hover:scale-105 transition-transform">
                <Hammer className="h-4 w-4" />
              </span>
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground hidden lg:block">
              DevTools Studio
            </span>
          </Link>

          {/* Divider */}
          <div className="h-5 w-px bg-border shrink-0" />

          {/* Nav links */}
          <nav className="flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map((l) => {
              const active = isActive(l.href)
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150',
                    active
                      ? 'text-primary bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  {l.label}
                  {active && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary opacity-70" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60">
              <a
                href="https://github.com/fakhrads/tools-website"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <GitHubIcon />
              </a>
            </Button>

            <ModeToggle />
          </div>
        </header>
      </div>

      {/* ── Mobile top bar ── */}
      <div className="fixed top-0 inset-x-0 z-50 md:hidden flex items-center justify-between h-14 px-4 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <Link href="/" className="flex items-center gap-2 group" aria-label="DevTools Studio">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity bg-gradient-to-br from-indigo-500 to-violet-600" />
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br from-indigo-500 to-violet-600">
              <Hammer className="h-4 w-4" />
            </span>
          </div>
          <span className="font-semibold text-sm tracking-tight">DevTools Studio</span>
        </Link>

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <a href="https://github.com/fakhrads/tools-website" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <GitHubIcon />
            </a>
          </Button>
          <ModeToggle />
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-background/90 backdrop-blur-xl border-t border-border/60 pb-safe">
        <div className="flex items-center justify-around h-16 px-1">
          {NAV_LINKS.map((l) => {
            const active = isActive(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 min-w-[56px]',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className={cn(
                  'inline-flex items-center justify-center h-6 w-6 transition-all',
                  active && 'scale-110'
                )}>
                  {l.icon}
                </span>
                <span className="text-[10px] font-medium leading-none">{l.label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
