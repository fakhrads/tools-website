import type { Metadata } from 'next'
import './globals.css'
import { ReactNode } from 'react'
import { NavBar } from '@/components/nav-bar'

export const metadata: Metadata = {
  title: 'DevTools Studio',
  description: 'Lightning-fast tools for developers',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-[100dvh] bg-gradient-to-b from-slate-50 to-white text-slate-900">
        <NavBar />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="border-t">
          <div className="container mx-auto px-4 py-6 text-xs text-slate-500">
            Made with ❤️ by fakhrads · Next.js · Tailwind + shadcn/ui
          </div>
        </footer>
      </body>
    </html>
  )
}
