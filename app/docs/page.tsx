'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { BookOpen, Search, ShieldCheck, KeyRound, Globe, Code2, Play, Copy, RotateCcw, Settings2, Wand2 } from 'lucide-react'

const authDocs = [
  {
    id: 'auth-overview',
    icon: ShieldCheck,
    title: 'Centralized Identity Overview (auth.fakhrads.dev)',
    category: 'Authentication',
    desc: 'Cara kerja SSO, shared cookie cross-subdomain, dan passkey biometrik FIDO2 di ekosistem fakhrads.dev.',
    steps: [
      'Auth server beroperasi di https://auth.fakhrads.dev dengan endpoint OIDC, WebAuthn/Passkey, dan Argon2id password fallback.',
      'Sesi login disimpan dalam HttpOnly cookie `auth_session` pada root domain `.fakhrads.dev` (Lax, Secure).',
      'Setiap subdomain (*.fakhrads.dev) otomatis menerima cookie sesi ini tanpa perlu login ulang.',
    ],
    code: `// Contoh verifikasi session di Client Component:
const res = await fetch('https://auth.fakhrads.dev/api/v1/auth/me', {
  credentials: 'include',
  headers: { 'Accept': 'application/json' }
});
const { authenticated, user } = await res.json();`,
    keywords: ['auth', 'identity', 'sso', 'cookie', 'passkey', 'oidc', 'jwt', 'security'],
  },
  {
    id: 'auth-login-flow',
    icon: KeyRound,
    title: 'Implementasi Login & Redirect Flow',
    category: 'Authentication',
    desc: 'Alur redirect user ke portal auth dan kembali ke aplikasi secara mulus.',
    steps: [
      'Trigger tombol login dengan mengarahkan user ke URL: `https://auth.fakhrads.dev/login?next=${encodeURIComponent(currentUrl)}`.',
      'User melakukan otentikasi via FaceID / TouchID / Passkey di HP atau Laptop.',
      'Setelah sukses, auth portal otomatis mengembalikan user ke URL tujuan (`next`) dengan cookie sesi aktif.',
    ],
    code: `// Trigger login function
function handleLogin() {
  const returnUrl = window.location.href;
  window.location.href = \`https://auth.fakhrads.dev/login?next=\${encodeURIComponent(returnUrl)}\`;
}`,
    keywords: ['login', 'redirect', 'flow', 'passkey', 'faceid', 'biometric', 'next'],
  },
  {
    id: 'auth-sdk-react',
    icon: Code2,
    title: 'React / Next.js AuthProvider Hook',
    category: 'Authentication',
    desc: 'Kode boilerplate reusable `AuthProvider` dan `useAuth()` untuk aplikasi React / Next.js.',
    steps: [
      'Buat file `lib/auth.tsx` yang membungkus aplikasi dengan Context Provider.',
      'Gunakan hook `useAuth()` di navbar atau komponen untuk membaca status `authenticated`, `user`, dan fungsi `login`/`logout`.',
    ],
    code: `import { useAuth } from '@/lib/auth';

export function UserProfile() {
  const { authenticated, user, login, logout } = useAuth();

  if (!authenticated) {
    return <button onClick={login}>Sign In with Passkey</button>;
  }

  return (
    <div>
      <p>Logged in as: {user.username}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}`,
    keywords: ['hook', 'react', 'nextjs', 'useauth', 'authprovider', 'context'],
  },
  {
    id: 'auth-backend-verify',
    icon: Globe,
    title: 'Verifikasi JWT & Forward Proxy di Backend',
    category: 'Authentication',
    desc: 'Cara backend API (Hono, Bun, Next.js API Routes, Express) memvalidasi token atau sesi user.',
    steps: [
      'Opsi 1 (Proxy/Traefik): Gunakan Forward Auth endpoint `GET https://auth.fakhrads.dev/api/v1/auth/verify-proxy` (header `X-User-Name`, `X-User-Id` disuntikkan otomatis).',
      'Opsi 2 (JWKS Stateless): Ambil public key dari `https://auth.fakhrads.dev/.well-known/jwks.json` lalu verifikasi signature Access Token menggunakan library `jose` (ES256).',
    ],
    code: `import { jwtVerify, createRemoteJWKSet } from 'jose';

const JWKS = createRemoteJWKSet(new URL('https://auth.fakhrads.dev/.well-known/jwks.json'));

async function verifyToken(bearerToken: string) {
  const { payload } = await jwtVerify(bearerToken, JWKS, {
    issuer: 'https://auth.fakhrads.dev',
  });
  return payload;
}`,
    keywords: ['backend', 'jwks', 'jwt', 'verify', 'proxy', 'traefik', 'api', 'token'],
  },
  // Existing Tool Guides
  {
    id: 'pick',
    icon: Wand2,
    title: 'Pilih tool yang kamu butuhkan',
    category: 'General',
    desc: 'Buka halaman Tools dan pilih fitur seperti JSON Lint, UUID Generator, atau Regex Tester.',
    steps: [
      'Klik menu "Tools" di navigasi utama.',
      'Pilih tool sesuai kebutuhan kamu.',
      'Setiap tool memiliki tampilan dan fungsi yang berbeda.',
    ],
    code: null,
    keywords: ['tools', 'pilih', 'json', 'uuid', 'regex', 'navigasi'],
  },
  {
    id: 'run',
    icon: Play,
    title: 'Masukkan data dan jalankan',
    category: 'General',
    desc: 'Tempelkan input sesuai tool yang dipilih lalu tekan tombol proses.',
    steps: [
      'Tempelkan teks atau data yang ingin diuji.',
      'Tekan tombol "Format", "Lint", atau "Run".',
      'Hasil muncul otomatis di area output.',
    ],
    code: null,
    keywords: ['input', 'data', 'format', 'lint', 'run', 'output', 'proses'],
  },
  {
    id: 'copy',
    icon: Copy,
    title: 'Salin atau simpan hasil',
    category: 'General',
    desc: 'Salin hasil ke clipboard atau unduh ke file sesuai format yang tersedia.',
    steps: [
      'Klik tombol "Copy" untuk menyalin ke clipboard.',
      'Gunakan "Download" jika tersedia untuk menyimpan file.',
      'Beberapa tool mendukung export ke .json, .txt, atau .png.',
    ],
    code: null,
    keywords: ['copy', 'salin', 'simpan', 'download', 'export', 'clipboard', 'file'],
  },
  {
    id: 'reset',
    icon: RotateCcw,
    title: 'Reset kapan saja',
    category: 'General',
    desc: 'Bersihkan input dan output dengan tombol reset — semua aman di sisi client.',
    steps: [
      'Klik ikon "Reset" untuk mengosongkan input/output.',
      'Semua proses dilakukan di browser — data tidak dikirim ke server.',
    ],
    code: null,
    keywords: ['reset', 'bersih', 'hapus', 'clear', 'client', 'browser', 'aman'],
  },
  {
    id: 'personalize',
    icon: Settings2,
    title: 'Personalisasi pengalaman',
    category: 'General',
    desc: 'Gunakan dark/light mode dan fitur pin untuk menyimpan tool favorit.',
    steps: [
      'Toggle tema gelap/terang di navbar kanan atas.',
      'Pin tool favorit dari halaman utama untuk akses cepat.',
    ],
    code: null,
    keywords: ['dark', 'light', 'tema', 'pin', 'favorit', 'personalisasi', 'mode'],
  },
]

export default function DocsPage() {
  const [q, setQ] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All')

  const categories = ['All', 'Authentication', 'General']

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase()
    return authDocs.filter((g) => {
      const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory
      if (!matchesCategory) return false

      if (!term) return true
      return (
        g.title.toLowerCase().includes(term) ||
        g.desc.toLowerCase().includes(term) ||
        g.keywords.some((k) => k.includes(term)) ||
        g.steps.some((s) => s.toLowerCase().includes(term)) ||
        (g.code && g.code.toLowerCase().includes(term))
      )
    })
  }, [q, selectedCategory])

  return (
    <div className="max-w-6xl grid gap-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dokumentasi & Panduan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Panduan implementasi Centralized Auth System (auth.fakhrads.dev) dan penggunaan DevTools Studio.
          </p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari dokumentasi (misal: 'auth', 'passkey', 'cookie', 'jwt')…"
            className="pl-9 rounded-xl bg-muted/60 border-border/60 focus-visible:ring-primary/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-muted/60 border border-border/60 rounded-xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                selectedCategory === cat
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      {filtered.length > 0 ? (
        <Accordion type="multiple" defaultValue={['auth-overview']} className="grid gap-3">
          {filtered.map((g) => (
            <AccordionItem
              key={g.id}
              value={g.id}
              className="rounded-2xl border border-border/60 bg-card px-2 overflow-hidden data-[state=open]:border-primary/40 transition-all shadow-sm"
            >
              <AccordionTrigger className="flex items-center gap-3.5 px-4 py-4 hover:no-underline group [&>svg]:text-muted-foreground [&>svg]:shrink-0">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-border/60 text-muted-foreground group-data-[state=open]:bg-primary/10 group-data-[state=open]:text-primary group-data-[state=open]:ring-primary/30 transition-colors">
                  <g.icon className="h-4.5 w-4.5" />
                </span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{g.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground">
                      {g.category}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{g.desc}</div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-5 pt-1 border-t border-border/40">
                <div className="ml-12 grid gap-4">
                  <p className="text-sm text-foreground/90 leading-relaxed">{g.desc}</p>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Langkah & Konsep:</h4>
                    <ul className="grid gap-2">
                      {g.steps.map((s, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {g.code && (
                    <div className="mt-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contoh Kode:</h4>
                      <pre className="p-4 rounded-xl bg-muted/80 border border-border/60 font-mono text-xs overflow-x-auto text-foreground/90 leading-relaxed">
                        <code>{g.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-7 w-7 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium">Dokumentasi tidak ditemukan</p>
          <p className="text-xs text-muted-foreground mt-1">Coba kata kunci lain atau pilih kategori "All"</p>
        </div>
      )}

      {/* Count */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground -mt-4">
          Menampilkan {filtered.length} dari {authDocs.length} dokumentasi
        </p>
      )}
    </div>
  )
}
