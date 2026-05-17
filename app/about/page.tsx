'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Info, Globe2, Wrench, Code2, Cpu, Rocket,
  ShieldCheck, Zap, ExternalLink
} from 'lucide-react'

const techs = [
  { name: 'Next.js 15',    icon: Globe2,   color: 'text-foreground' },
  { name: 'Tailwind CSS',  icon: Wrench,   color: 'text-sky-500' },
  { name: 'shadcn/ui',     icon: Code2,    color: 'text-violet-500' },
  { name: 'TypeScript',    icon: Cpu,      color: 'text-blue-500' },
  { name: 'Bun',           icon: Rocket,   color: 'text-amber-500' },
]

const values = [
  { icon: Zap,         title: 'Fast',    desc: 'Semua berjalan di browser — nol latensi, bisa offline.' },
  { icon: ShieldCheck, title: 'Private', desc: 'Data tidak pernah meninggalkan perangkat kamu.' },
  { icon: Code2,       title: 'Open',    desc: 'Kode terbuka, mudah dikembangkan dan dikontribusi.' },
]

export default function AboutPage() {
  return (
    <div className="max-w-6xl grid gap-12">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
          <Info className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tentang DevTools Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform tools developer cepat, ringan, dan bisa diakses kapan saja.
          </p>
        </div>
      </div>

      {/* Vision */}
      <section className="grid gap-4">
        <h2 className="text-sm font-semibold text-foreground">Visi & Tujuan</h2>
        <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            DevTools Studio dikembangkan sebagai kumpulan{' '}
            <span className="text-foreground font-medium">developer tools sederhana</span>,
            terinspirasi dari kebutuhan harian seorang engineer mulai dari linting JSON,
            konversi teks, hingga generator ID unik.
          </p>
          <p>
            Fokusnya adalah{' '}
            <span className="text-foreground font-medium">produktivitas dan konsistensi UI</span>,
            dengan desain bersih, cepat diakses, serta bebas iklan.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="grid gap-4">
        <h2 className="text-sm font-semibold text-foreground">Prinsip</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {values.map((v) => (
            <div key={v.title} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-primary">
                <v.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">{v.title}</div>
                <p className="mt-1 text-xs text-muted-foreground">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="grid gap-4">
        <h2 className="text-sm font-semibold text-foreground">Teknologi</h2>
        <div className="flex flex-wrap gap-2">
          {techs.map((t) => (
            <Badge
              key={t.name}
              variant="secondary"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-card border border-border/60"
            >
              <t.icon className={`h-3.5 w-3.5 ${t.color}`} />
              {t.name}
            </Badge>
          ))}
        </div>
      </section>

      {/* Developer */}
      <section className="grid gap-4">
        <h2 className="text-sm font-semibold text-foreground">Pengembang</h2>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-5">
          <div>
            <div className="text-sm font-semibold text-foreground">Fakhri Adi Saputra</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Software Engineer · fakhrads.dev</div>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-xl gap-1.5 shrink-0">
            <a href="https://fakhrads.dev" target="_blank" rel="noopener noreferrer">
              Portfolio <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
