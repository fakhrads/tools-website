'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const changelogs = [
  {
    version: 'v1.2.0',
    date: '19 Oktober 2025',
    changes: [
      'Menambahkan halaman Dokumentasi dan Changelogs',
      'Perbaikan UI di halaman JSON Lint (mobile responsive)',
      'Optimisasi performa pada layout Tools',
    ],
  },
  {
    version: 'v1.1.0',
    date: '12 Oktober 2025',
    changes: [
      'Menambahkan sidebar navigasi pada halaman Tools',
      'Meningkatkan sistem routing agar menggunakan App Router penuh',
      'Perbaikan warna tema dan tombol aksi',
    ],
  },
  {
    version: 'v1.0.0',
    date: '5 Oktober 2025',
    changes: [
      'Rilis awal aplikasi Tools Studio',
      'Menambahkan halaman JSON Lint, UUID Generator, dan Base64 Converter',
    ],
  },
]

export default function ChangelogsPage() {
  return (
    <section className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">🧾 Riwayat Perubahan</h1>
      <p className="text-muted-foreground mb-8">
        Catatan perubahan setiap versi aplikasi.
      </p>
      <Separator className="mb-10" />

      <div className="space-y-8">
        {changelogs.map((log, idx) => (
          <Card
            key={idx}
            className="border border-slate-200/80 rounded-xl hover:shadow-sm transition-all"
          >
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                  {log.version}
                </Badge>
                <span className="text-sm text-slate-500">{log.date}</span>
              </div>
              <CardTitle className="mt-2 sm:mt-0 text-lg">Perubahan</CardTitle>
            </CardHeader>

            <CardContent>
              <ul className="list-disc list-inside text-slate-700 space-y-1 text-sm">
                {log.changes.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
