import type { Metadata } from 'next'
import './globals.css'
import { ReactNode } from 'react'
import { NavBar } from '@/components/nav-bar'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'DevTools Studio',
  description: 'Lightning-fast tools for developers',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NavBar />
          {/* pt accounts for floating navbar height; pb-20 for mobile bottom nav */}
          <main className="mx-auto w-full max-w-6xl px-4 pt-24 pb-24 md:pt-28 md:pb-10">
            {children}
          </main>
          <footer className="border-t border-border/60 mb-16 md:mb-0">
            <div className="mx-auto w-full max-w-6xl px-4 py-5 text-xs text-muted-foreground flex items-center justify-between gap-4">
              <span>Made with ❤️ by fakhrads · Next.js · Tailwind + shadcn/ui</span>
              <span className="text-muted-foreground/50">{new Date().getFullYear()}</span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
