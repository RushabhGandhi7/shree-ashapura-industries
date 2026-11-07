// Renders one product image per category from the procedural 3D parts (never from
// catalogue photos): opens /lab?render=<slug> in Playwright, waits for the scene, and
// saves public/products/<slug>.webp (1200×900) plus an Open Graph collage
// (public/products/og-products.webp, 1200×630).
//
//   npm run render:products            # starts Vite on :5179 for the run
//   BASE_URL=http://localhost:5173 npm run render:products   # reuse a running dev server
//
// Uses Playwright's Chromium, or the installed Google Chrome if that is missing.
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import sharp from 'sharp'
import { MARK } from '../src/components/ui/logoMark.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public/products')
const W = 1200
const H = 900

const { categories } = await import(pathToFileURL(path.join(ROOT, 'src/data/products.js')).href)

async function startServer() {
  if (process.env.BASE_URL) return { url: process.env.BASE_URL, stop: () => {} }
  const port = 5179
  const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], { cwd: ROOT, stdio: 'pipe' })
  const url = `http://localhost:${port}`
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return { url, stop: () => proc.kill() }
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  proc.kill()
  throw new Error('Vite dev server did not start')
}

async function launch() {
  const args = ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']
  try {
    return await chromium.launch({ args })
  } catch {
    return await chromium.launch({ channel: 'chrome', args })
  }
}

const server = await startServer()
const browser = await launch()
await mkdir(OUT, { recursive: true })
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
page.on('pageerror', (e) => console.error('page error:', e.message))
const files = []
try {
  for (const c of categories) {
    await page.goto(`${server.url}/lab?render=${c.slug}`)
    await page.waitForFunction(() => window.__renderReady === true, null, { timeout: 30000 })
    await page.waitForTimeout(300)
    const png = await page.locator('canvas').screenshot()
    const file = path.join(OUT, `${c.slug}.webp`)
    const info = await sharp(png).resize(W, H).webp({ quality: 80, effort: 6 }).toFile(file)
    files.push(file)
    console.log(`${c.slug}.webp  ${(info.size / 1024).toFixed(0)} kB`)
  }

  // Open Graph collage: 4 × 2 tiles on paper, 1200 × 630
  const tw = 300
  const th = 225
  const tiles = await Promise.all(files.map((f) => sharp(f).resize(tw, th).toBuffer()))
  const head = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="90">
    <svg x="36" y="28" width="56" height="36" viewBox="${MARK.viewBox}"><path fill="#1E1F21" d="${MARK.d}"/><circle fill="#C8102E" cx="${MARK.dot.cx}" cy="${MARK.dot.cy}" r="${MARK.dot.r}"/></svg>
    <text x="104" y="56" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="800" fill="#1E1F21">SHREE ASHAPURA INDUSTRIES</text>
    <text x="1160" y="56" text-anchor="end" font-family="Menlo, monospace" font-size="18" letter-spacing="2" fill="#55575A">FASTENERS · TURNED PARTS · FURNITURE FITTINGS · MUMBAI</text>
  </svg>`)
  const collage = sharp({ create: { width: 1200, height: 630, channels: 3, background: '#F6F4EF' } }).composite([
    { input: head, left: 0, top: 0 },
    ...tiles.map((input, i) => ({ input, left: (i % 4) * tw, top: 90 + Math.floor(i / 4) * th })),
  ])
  const buf = await collage.png().toBuffer()
  const info = await sharp(buf).webp({ quality: 82 }).toFile(path.join(OUT, 'og-products.webp'))
  // JPG too: some link-preview scrapers do not accept WebP for og:image
  const jpg = await sharp(buf).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(OUT, 'og-products.jpg'))
  console.log(`og-products.webp  ${(info.size / 1024).toFixed(0)} kB · og-products.jpg  ${(jpg.size / 1024).toFixed(0)} kB`)
} finally {
  await browser.close()
  server.stop()
}
