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
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
          <footer className="border-t border-border">
            <div className="container mx-auto px-4 py-6 text-xs text-muted-foreground">
              Made with ❤️ by fakhrads · Next.js · Tailwind + shadcn/ui
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
