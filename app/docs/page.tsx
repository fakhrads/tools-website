'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Wand2, Play, Copy, Share2, Settings2 } from 'lucide-react'

export default function DocsPage() {
  const guides = [
    {
      icon: Wand2,
      title: 'Pilih Tools yang Kamu Butuhkan',
      desc: 'Masuk ke halaman Tools dan pilih fitur seperti JSON Lint, UUID Generator, atau Base64 Converter.',
      steps: [
        'Klik menu “Tools” di navigasi utama.',
        'Pilih tools sesuai kebutuhan kamu.',
        'Setiap tools memiliki tampilan dan fungsi yang berbeda.',
      ],
    },
    {
      icon: Play,
      title: 'Masukkan Data dan Jalankan',
      desc: 'Isikan input sesuai tools yang dipilih lalu tekan tombol proses.',
      steps: [
        'Tempelkan teks atau data yang ingin diuji.',
        'Tekan tombol seperti “Format”, “Lint”, atau “Run”.',
        'Hasil akan muncul otomatis di area output di bawahnya.',
      ],
    },
    {
      icon: Copy,
      title: 'Salin atau Simpan Hasil',
      desc: 'Kamu bisa menyalin hasil ke clipboard atau mengunduh dalam format file.',
      steps: [
        'Klik tombol “Copy” untuk menyalin hasil ke clipboard.',
        'Jika tersedia, gunakan tombol “Download” untuk menyimpan hasil.',
        'Beberapa tools mendukung export ke file `.json`, `.txt`, atau `.png`.',
      ],
    },
    {
      icon: Share2,
      title: 'Reset',
      desc: 'Gunakan tombol reset untuk membersihkan input, atau bagikan hasilmu.',
      steps: [
        'Klik ikon “Reset” untuk mengosongkan input/output.',
        'Semua proses dilakukan di sisi client — aman dan cepat.',
      ],
    },
    {
      icon: Settings2,
      title: 'Personalisasi Pengalaman',
      desc: 'Aplikasi akan terus berkembang — nantinya kamu bisa ubah tema, preferensi, dan layout.',
      steps: [
        'Gunakan mode terang/gelap sesuai preferensi kamu.',
        'Setelan tambahan akan ditambahkan seiring update versi berikutnya.',
      ],
    },
  ]

  return (
    <section className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">📘 Panduan Penggunaan</h1>
      <p className="text-muted-foreground mb-8">
        Pelajari langkah-langkah dasar untuk menggunakan aplikasi ini dengan efisien.
      </p>
      <Separator className="mb-10" />

      <div className="space-y-6">
        {guides.map((g, idx) => (
          <Card
            key={idx}
            className="hover:shadow-md transition-all border border-slate-200/80 rounded-xl"
          >
            <CardHeader className="flex items-center gap-3">
              <g.icon className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-lg">{g.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-600">{g.desc}</p>
              <ul className="list-decimal list-inside text-sm text-slate-700 space-y-1">
                {g.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
