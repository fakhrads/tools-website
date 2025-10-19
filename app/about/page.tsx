'use client'

import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Code2, Cpu, Globe2, Rocket, Wrench } from 'lucide-react'

export default function AboutPage() {
  const techs = [
    { name: 'Next.js 15', icon: Globe2 },
    { name: 'Tailwind CSS', icon: Wrench },
    { name: 'ShadCN UI', icon: Code2 },
    { name: 'TypeScript', icon: Cpu },
    { name: 'Bun', icon: Rocket },
  ]

  return (
    <section className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">ℹ️ Tentang Aplikasi</h1>
      <p className="text-muted-foreground mb-8">
        Platform ini dirancang untuk membantu developer dan engineer dalam bekerja
        dengan berbagai tools kecil namun berguna — cepat, ringan, dan dapat diakses di mana saja.
      </p>
      <Separator className="mb-10" />

      <Card className="border border-slate-200/80 rounded-xl mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Visi & Tujuan</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-700 text-sm leading-relaxed space-y-3">
          <p>
            Aplikasi ini dikembangkan sebagai kumpulan <strong>Developer Tools</strong> sederhana,
            terinspirasi dari kebutuhan harian seorang engineer — mulai dari linting JSON,
            konversi teks, hingga generator unik.
          </p>
          <p>
            Fokusnya adalah <strong>produktivitas dan konsistensi UI</strong>, dengan desain yang
            bersih, cepat diakses, serta bebas dari gangguan iklan.
          </p>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/80 rounded-xl mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Teknologi yang Digunakan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mt-2">
            {techs.map((t, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="px-3 py-1.5 flex items-center gap-2 text-sm bg-slate-100"
              >
                <t.icon className="w-4 h-4 text-blue-600" />
                {t.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/80 rounded-xl mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Tentang Pengembang</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-700 text-sm leading-relaxed space-y-3">
          <p>
            Dibuat dan dikelola oleh <strong>Fakhri Adi Saputra</strong> — seorang software engineer
            di PT Astra Honda Motor, sekaligus founder dari{' '}
            <span className="font-semibold text-blue-600">Raznar Digital Nusantara</span>.
          </p>
          <p>
            Tujuan pengembangan aplikasi ini adalah untuk menyediakan tools open-access
            bagi developer Indonesia agar dapat bekerja lebih efisien dan produktif.
          </p>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-center">
        <Button asChild className="rounded-full px-6">
          <a href="https://fakhrads.dev" target="_blank" rel="noopener noreferrer">
            Kunjungi Portfolio Saya
          </a>
        </Button>
      </div>
    </section>
  )
}
