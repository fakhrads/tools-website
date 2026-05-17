'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Pipette, RefreshCcw, Download } from 'lucide-react'

type RGB = { r: number; g: number; b: number }
type HSL = { h: number; s: number; l: number }

function clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)) }
function hex2(v: number) { return v.toString(16).padStart(2, '0') }
function rgbToHex({ r, g, b }: RGB) { return `#${hex2(r)}${hex2(g)}${hex2(b)}`.toUpperCase() }
function hexToRgb(s: string): RGB | null {
  const m = s.trim().replace(/^#/,'').toLowerCase()
  if (/^[0-9a-f]{3}$/.test(m)) {
    const r = parseInt(m[0]+m[0],16), g = parseInt(m[1]+m[1],16), b = parseInt(m[2]+m[2],16)
    return { r, g, b }
  }
  if (/^[0-9a-f]{6}$/.test(m)) {
    const r = parseInt(m.slice(0,2),16), g = parseInt(m.slice(2,4),16), b = parseInt(m.slice(4,6),16)
    return { r, g, b }
  }
  return null
}
function rgbToHsl({ r, g, b }: RGB): HSL {
  const R = r/255, G = g/255, B = b/255
  const max = Math.max(R,G,B), min = Math.min(R,G,B)
  const d = max - min
  let h = 0
  if (d) {
    if (max === R) h = ((G - B) / d + (G < B ? 6 : 0))
    else if (max === G) h = (B - R) / d + 2
    else h = (R - G) / d + 4
    h *= 60
  }
  const l = (max + min) / 2
  const s = d === 0 ? 0 : d / (1 - Math.abs(2*l - 1))
  return { h, s: s*100, l: l*100 }
}
function hslToRgb({ h, s, l }: HSL): RGB {
  const H = (h % 360 + 360) % 360, S = clamp(s,0,100)/100, L = clamp(l,0,100)/100
  if (S === 0) { const v = Math.round(L*255); return { r:v,g:v,b:v } }
  const C = (1 - Math.abs(2*L - 1)) * S
  const X = C * (1 - Math.abs(((H/60)%2) - 1))
  const m = L - C/2
  let r=0,g=0,b=0
  if (0<=H&&H<60){r=C;g=X;b=0}else if(60<=H&&H<120){r=X;g=C;b=0}
  else if(120<=H&&H<180){r=0;g=C;b=X}else if(180<=H&&H<240){r=0;g=X;b=C}
  else if(240<=H&&H<300){r=X;g=0;b=C}else {r=C;g=0;b=X}
  return { r:Math.round((r+m)*255), g:Math.round((g+m)*255), b:Math.round((b+m)*255) }
}
function parseCssColor(input: string): RGB | null {
  const s = input.trim()
  const hx = hexToRgb(s); if (hx) return hx
  if (/^rgb/i.test(s)) {
    const m = s.match(/rgba?\(([^)]+)\)/i); if (!m) return null
    const [r,g,b] = m[1].split(',').slice(0,3).map(x=>Math.round(Number(x.trim())))
    if ([r,g,b].every(Number.isFinite)) return { r, g, b }
  }
  if (/^hsl/i.test(s)) {
    const m = s.match(/hsla?\(([^)]+)\)/i); if (!m) return null
    const [h, s1, l1] = m[1].split(',').slice(0,3).map(x=>x.trim())
    const hN = Number(h), sN = Number(String(s1).replace('%','')), lN = Number(String(l1).replace('%',''))
    if ([hN,sN,lN].every(Number.isFinite)) return hslToRgb({ h: hN, s: sN, l: lN })
  }
  const d = document.createElement('div')
  d.style.color = s
  document.body.appendChild(d)
  const c = getComputedStyle(d).color
  document.body.removeChild(d)
  if (c && /^rgb/.test(c)) {
    const m = c.match(/rgba?\(([^)]+)\)/i)
    if (m) {
      const [r,g,b] = m[1].split(',').slice(0,3).map(x=>Math.round(Number(x.trim())))
      if ([r,g,b].every(Number.isFinite)) return { r,g,b }
    }
  }
  return null
}
function luminance(rgb: RGB) {
  const s = [rgb.r, rgb.g, rgb.b].map(v=>{
    const c = v/255
    return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4)
  })
  return 0.2126*s[0] + 0.7152*s[1] + 0.0722*s[2]
}
function contrastRatio(a: RGB, b: RGB) {
  const L1 = luminance(a), L2 = luminance(b)
  const [lighter, darker] = L1 > L2 ? [L1,L2] : [L2,L1]
  return (lighter + 0.05) / (darker + 0.05)
}
function fmt(n: number, p=2) { return Number(n.toFixed(p)) }
function useLocal<T>(key: string, init: T) {
  const [v,setV] = React.useState<T>(() => {
    try{ const s = localStorage.getItem(key); return s? JSON.parse(s): init }catch{ return init }
  })
  React.useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(v)) }catch{} },[key,v])
  return [v,setV] as const
}
function copy(s: string){ navigator.clipboard.writeText(s) }
function normalizeHexCandidate(s: string){
  const v = s.trim()
  if (/^#?[0-9a-fA-F]{3}$/.test(v)) return ('#' + v.replace('#','')).toUpperCase()
  if (/^#?[0-9a-fA-F]{6}$/.test(v)) return ('#' + v.replace('#','')).toUpperCase()
  const rgb = parseCssColor(v); return rgb ? rgbToHex(rgb) : v
}
function bestTextOn(bg: RGB){
  const black = { r:0,g:0,b:0 }, white = { r:255,g:255,b:255 }
  const rb = contrastRatio(bg, black), rw = contrastRatio(bg, white)
  return rw >= rb ? '#FFFFFF' : '#000000'
}
function buildCssVars(name: string, baseHex: string, steps: { step: string; hex: string }[], fgHex?: string){
  const lines = [`:root {`, `  --${name}: ${baseHex};`]
  if (fgHex) lines.push(`  --${name}-foreground: ${fgHex};`)
  steps.forEach(s => lines.push(`  --${name}-${s.step}: ${s.hex};`))
  lines.push('}')
  return lines.join('\n')
}
function buildTailwind(name: string, steps: { key: string; hex: string }[]){
  const entries = steps.map(s => `      ${s.key}: 'var(--${name}-${s.key})'`).join(',\n')
  return [
`// tailwind.config.ts`,
`theme: {`,
`  extend: {`,
`    colors: {`,
`      ${name}: {`,
entries,
`      }`,
`    }`,
`  }`,
`}`
].join('\n')
}
function download(filename: string, content: string){
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
function mixHex(a: string, b: string, t: number){
  const A = hexToRgb(a)!, B = hexToRgb(b)!
  const r = Math.round(A.r + (B.r - A.r)*t)
  const g = Math.round(A.g + (B.g - A.g)*t)
  const bl = Math.round(A.b + (B.b - A.b)*t)
  return rgbToHex({ r, g, b: bl })
}

export default function ColorPickerPage(){
  const [hexInput, setHexInput] = useLocal('cp_hex','#2D79C7')
  const [bgHex, setBgHex] = useLocal('cp_bg','#FFFFFF')
  const [altHex, setAltHex] = useLocal('cp_alt','#7AB0EA')
  const [angle, setAngle] = useLocal('cp_angle', 45 as any)
  const [recent, setRecent] = useLocal<string[]>('cp_recent', [])

  const base = React.useMemo(()=>parseCssColor(hexInput) ?? {r:45,g:121,b:199},[hexInput])
  const bg = React.useMemo(()=>parseCssColor(bgHex) ?? {r:255,g:255,b:255},[bgHex])
  const alt = React.useMemo(()=>parseCssColor(altHex) ?? {r:122,g:176,b:234},[altHex])

  React.useEffect(()=> {
    const hx = rgbToHex(base)
    setRecent(r => [hx, ...r.filter(x=>x!==hx)].slice(0,8))
  }, [hexInput, setRecent])

  const baseHsl = rgbToHsl(base)
  const baseHex = rgbToHex(base)
  const lightSteps: Record<number,number> = {50:.92,100:.85,200:.70,300:.55,400:.40}
  const darkSteps:  Record<number,number> = {600:.20,700:.35,800:.55,900:.75}
  const paletteArr = [
    ...Object.entries(lightSteps).map(([k,t])=>({ key:k, hex: mixHex('#FFFFFF', baseHex, t) })),
    { key:'500', hex: baseHex },
    ...Object.entries(darkSteps).map(([k,t])=>({ key:k, hex: mixHex(baseHex, '#000000', t) })),
  ].sort((a,b)=>Number(a.key)-Number(b.key))

  const ratio = contrastRatio(base, bg)
  const ratioLargePass = ratio >= 3
  const ratioAA = ratio >= 4.5
  const ratioAAA = ratio >= 7

  const setHexSafe = (v: string) => { setHexInput(normalizeHexCandidate(v)) }
  const setAltHexSafe = (v: string) => { setAltHex(normalizeHexCandidate(v)) }
  const setBgHexSafe = (v: string) => { setBgHex(normalizeHexCandidate(v)) }

  const rgb = base
  const hsl = baseHsl
  const rgbStr = `${rgb.r}, ${rgb.g}, ${rgb.b}`
  const hslStr = `${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%`
  const brandFgHex = bestTextOn(base)
  const cssVars = buildCssVars('brand', baseHex, paletteArr.map(p=>({ step: p.key, hex: p.hex })), brandFgHex)
  const twLines = buildTailwind('brand', paletteArr)
  const gradientCss = `linear-gradient(${angle}deg, ${rgbToHex(base)} 0%, ${rgbToHex(alt)} 100%)`

  const randomize = () => {
    const h = Math.floor(Math.random()*360)
    const s = 40 + Math.random()*50
    const l = 40 + Math.random()*30
    const rgbN = hslToRgb({ h, s, l })
    setHexInput(rgbToHex(rgbN))
    const altN = hslToRgb({ h:(h+20)%360, s: clamp(s+10,0,100), l: clamp(l+10,0,100) })
    setAltHex(rgbToHex(altN))
  }
  const eyedrop = async () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.EyeDropper) {
      // @ts-ignore
      const ed = new window.EyeDropper()
      try { const res = await ed.open(); setHexInput(res.sRGBHex.toUpperCase()) } catch {}
    }
  }
  const bgHexPresetValue = (v: string) => {
    const u = v.toUpperCase()
    if (u === '#FFFFFF') return '#FFFFFF'
    if (u === '#000000') return '#000000'
    return v
  }
  const onChipClick = (p: {key:string; hex:string}, ev: React.MouseEvent) => {
    if (ev.altKey) copy(`var(--brand-${p.key})`)
    else copy(p.hex)
  }

  return (
    <section className="grid gap-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Color Picker</h1>
          <Badge variant="secondary" className="text-sm">Palette • Contrast • Gradient</Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Pilih dan eksplorasi warna, buat palet, cek kontras, dan generate gradient dengan alat yang lengkap.
        </p>
      </div>

      {/* Main Color Picker Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Pilih Warna</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Recent Colors */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Warna Terbaru</Label>
            <div className="flex gap-2 flex-wrap">
              {recent.map(h => (
                <button
                  type="button"
                  key={h}
                  onClick={()=>setHexInput(h)}
                  className="h-8 w-8 rounded-lg border-2 border-muted shadow-sm hover:scale-105 transition-transform"
                  style={{background:h}}
                  title={h}
                />
              ))}
            </div>
          </div>

          {/* Color Input & Controls */}
          <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
            <div className="space-y-6">
              {/* Main Color Picker */}
              <div className="flex items-start gap-4">
                <input
                  aria-label="picker"
                  type="color"
                  value={baseHex}
                  onChange={(e)=>setHexSafe(e.target.value)}
                  className="h-14 w-14 rounded-xl border-2 border-muted cursor-pointer"
                />
                <div className="space-y-3 flex-1">
                  <div className="flex gap-2 flex-wrap">
                    <Input
                      value={hexInput}
                      onChange={(e)=>setHexSafe(e.target.value)}
                      className="w-40 font-mono text-sm"
                      placeholder="#2D79C7"
                    />
                    <Button variant="secondary" onClick={()=>copy(hexInput)} size="sm">
                      <Copy className="h-4 w-4 mr-2" /> Copy
                    </Button>
                    <Button variant="outline" onClick={randomize} size="sm">
                      <RefreshCcw className="h-4 w-4 mr-2" /> Random
                    </Button>
                    <Button
                      variant="outline"
                      onClick={eyedrop}
                      size="sm"
                      disabled={typeof window==='undefined' || !(window as any).EyeDropper}
                    >
                      <Pipette className="h-4 w-4 mr-2" /> Eyedrop
                    </Button>
                  </div>

                  {/* RGB/HSL Inputs */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">RGB Values</Label>
                      <div className="flex gap-2">
                        <div className="space-y-1 flex-1">
                          <Label className="text-xs text-muted-foreground">R</Label>
                          <Input
                            value={rgb.r}
                            type="number"
                            min={0}
                            max={255}
                            onChange={(e)=>setHexInput(rgbToHex({ r:clamp(+e.target.value||0,0,255), g:rgb.g, b:rgb.b }))}
                            className="font-mono text-sm h-9"
                          />
                        </div>
                        <div className="space-y-1 flex-1">
                          <Label className="text-xs text-muted-foreground">G</Label>
                          <Input
                            value={rgb.g}
                            type="number"
                            min={0}
                            max={255}
                            onChange={(e)=>setHexInput(rgbToHex({ r:rgb.r, g:clamp(+e.target.value||0,0,255), b:rgb.b }))}
                            className="font-mono text-sm h-9"
                          />
                        </div>
                        <div className="space-y-1 flex-1">
                          <Label className="text-xs text-muted-foreground">B</Label>
                          <Input
                            value={rgb.b}
                            type="number"
                            min={0}
                            max={255}
                            onChange={(e)=>setHexInput(rgbToHex({ r:rgb.r, g:rgb.g, b:clamp(+e.target.value||0,0,255) }))}
                            className="font-mono text-sm h-9"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">HSL Values</Label>
                      <div className="flex gap-2">
                        <div className="space-y-1 flex-1">
                          <Label className="text-xs text-muted-foreground">H</Label>
                          <Input
                            value={Math.round(hsl.h)}
                            type="number"
                            min={0}
                            max={360}
                            onChange={(e)=>setHexInput(rgbToHex(hslToRgb({ h:+e.target.value||0, s:hsl.s, l:hsl.l })))}
                            className="font-mono text-sm h-9"
                          />
                        </div>
                        <div className="space-y-1 flex-1">
                          <Label className="text-xs text-muted-foreground">S</Label>
                          <Input
                            value={Math.round(hsl.s)}
                            type="number"
                            min={0}
                            max={100}
                            onChange={(e)=>setHexInput(rgbToHex(hslToRgb({ h:hsl.h, s:+e.target.value||0, l:hsl.l })))}
                            className="font-mono text-sm h-9"
                          />
                        </div>
                        <div className="space-y-1 flex-1">
                          <Label className="text-xs text-muted-foreground">L</Label>
                          <Input
                            value={Math.round(hsl.l)}
                            type="number"
                            min={0}
                            max={100}
                            onChange={(e)=>setHexInput(rgbToHex(hslToRgb({ h:hsl.h, s:hsl.s, l:+e.target.value||0 })))}
                            className="font-mono text-sm h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Background Selector */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Background untuk Kontras</Label>
                    <div className="flex items-center gap-2">
                      <select
                        title='bg'
                        className="border rounded-lg h-9 px-2 text-sm flex-1"
                        value={bgHexPresetValue(bgHex)}
                        onChange={(e)=>setBgHexSafe(e.target.value)}
                      >
                        <option value="#FFFFFF">White</option>
                        <option value="#000000">Black</option>
                        <option value={bgHex}>Custom</option>
                      </select>
                      <input
                        title='bg'
                        type="color"
                        value={rgbToHex(bg)}
                        onChange={(e)=>setBgHexSafe(e.target.value)}
                        className="h-9 w-9 rounded-lg border cursor-pointer"
                      />
                      <Input
                        value={bgHex}
                        onChange={(e)=>setBgHexSafe(e.target.value)}
                        className="w-32 font-mono text-sm h-9"
                      />
                    </div>
                  </div>

                  {/* Color Values Display */}
                  <div className="text-xs text-muted-foreground font-mono space-y-1">
                    <div>RGB: ({rgbStr})</div>
                    <div>HSL: ({hslStr})</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="rounded-xl border overflow-hidden shadow-sm">
              {/* Contrast ratio bar — di atas preview, bukan absolute overlay */}
              <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b bg-muted/30">
                <ContrastBadge r={ratio} />
                <Badge variant="outline" className="text-xs font-mono">{fmt(ratio,2)}:1</Badge>
                <Badge variant="outline" className="text-xs">{ratioAA ? 'AA pass' : 'AA fail'}</Badge>
                <Badge variant="outline" className="text-xs">{ratioAAA ? 'AAA pass' : 'AAA fail'}</Badge>
                <Badge variant="outline" className="text-xs">{ratioLargePass ? 'Large AA' : 'Large fail'}</Badge>
              </div>
              <div className="grid md:grid-cols-2 divide-x divide-y md:divide-y-0">
                {/* Normal Preview */}
                <div className="p-6 min-h-[200px]" style={{ background: rgbToHex(bg), color: baseHex }}>
                  <div className="space-y-4">
                    <div className="text-2xl font-semibold">Headline Text Example</div>
                    <div className="text-base leading-relaxed">
                      Body text preview looks like this paragraph over the selected background color.
                      This helps you visualize how readable your text will be.
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md border font-medium hover:opacity-90 transition-opacity"
                      style={{ background: 'transparent', color: 'inherit', borderColor: 'currentColor' }}
                    >
                      Example Button
                    </button>
                  </div>
                </div>

                {/* Inverted Preview */}
                <div className="p-6 min-h-[200px]" style={{ background: baseHex, color: brandFgHex }}>
                  <div className="text-xs font-medium mb-4 opacity-80 uppercase tracking-wide">Inverted Preview</div>
                  <div className="space-y-4">
                    <div className="text-2xl font-semibold">Headline Text Example</div>
                    <div className="text-base leading-relaxed">
                      This shows how text looks when your color is used as a background instead.
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md border font-medium hover:opacity-90 transition-opacity"
                      style={{ background: 'transparent', color: 'inherit', borderColor: 'currentColor' }}
                    >
                      Example Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Palette Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Color Palette</Label>
              <span className="text-xs text-muted-foreground">
                Klik untuk copy, Alt+Klik untuk copy CSS variable
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {paletteArr.map(p => (
                <button
                  type="button"
                  key={p.key}
                  onClick={(ev)=>onChipClick(p, ev)}
                  className="group rounded-xl border overflow-hidden text-left shadow-sm hover:shadow-md hover:border-border transition-all duration-200"
                >
                  <div className="h-16" style={{ background: p.hex }} />
                  <div className="px-2.5 py-2 bg-background grid gap-0.5">
                    <div className="text-xs font-medium truncate">brand-{p.key}</div>
                    <div className="text-xs font-mono text-muted-foreground truncate group-hover:text-foreground transition-colors">
                      {p.hex}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Button size="sm" variant="secondary" onClick={()=>copy(cssVars)}>
                <Copy className="mr-2 h-4 w-4" /> Copy CSS Vars
              </Button>
              <Button size="sm" variant="outline" onClick={()=>download('brand.css', cssVars)}>
                <Download className="mr-2 h-4 w-4" /> Download CSS
              </Button>
              <Button size="sm" variant="secondary" onClick={()=>copy(twLines)}>
                <Copy className="mr-2 h-4 w-4" /> Copy Tailwind
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gradient Builder Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Gradient Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  title='alt color'
                  type="color"
                  value={rgbToHex(alt)}
                  onChange={(e)=>setAltHexSafe(e.target.value)}
                  className="h-12 w-12 rounded-xl border-2 border-muted cursor-pointer"
                />
                <Input
                  value={altHex}
                  onChange={(e)=>setAltHexSafe(e.target.value)}
                  className="w-40 font-mono text-sm"
                  placeholder="#7AB0EA"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Angle: {angle}°</Label>
                <input
                  title='angle'
                  type="range"
                  min={0}
                  max={360}
                  value={angle}
                  onChange={(e)=>setAngle(Number(e.target.value))}
                  className="w-full h-2"
                />
              </div>
            </div>
            <div className="rounded-xl border h-40 shadow-inner" style={{ background: gradientCss }} />
          </div>
          <div className="flex gap-3">
            <Input
              readOnly
              value={gradientCss}
              className="font-mono text-sm flex-1"
            />
            <Button variant="secondary" onClick={()=>copy(gradientCss)}>
              <Copy className="mr-2 h-4 w-4" /> Copy CSS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Design Tokens Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Design Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">CSS Variables</Label>
            <ScrollArea className="h-48 rounded-lg border p-4 bg-muted/20">
              <pre className="text-xs font-mono leading-relaxed">{cssVars}</pre>
            </ScrollArea>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tailwind Configuration</Label>
            <ScrollArea className="h-48 rounded-lg border p-4 bg-muted/20">
              <pre className="text-xs font-mono leading-relaxed">{twLines}</pre>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function ContrastBadge({ r }: { r: number }){
  const ok = r >= 4.5
  const tone = ok ? 'bg-emerald-600' : r >= 3 ? 'bg-amber-600' : 'bg-rose-600'
  const label = ok ? 'AA' : r >= 3 ? 'AA (Large)' : 'Fail'
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white ${tone}`}>
      {label}
    </span>
  )
}
