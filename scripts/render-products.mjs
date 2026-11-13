// Renders one product image per category from the procedural 3D parts (never from
// catalogue photos): opens /lab?render=<slug> in Playwright, waits for the scene, and
// saves public/products/<slug>.webp (1600×1200, transparent: the card's grid shows through,
// exactly like behind the live canvas) plus an Open Graph collage
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
const W = 1600 // ≥ 2× every container that shows it (cards, category stage)
const H = 1200

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
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
page.on('pageerror', (e) => console.error('page error:', e.message))
const files = []
try {
  for (const c of categories) {
    await page.goto(`${server.url}/lab?render=${c.slug}`)
    await page.waitForFunction(() => window.__renderReady === true, null, { timeout: 30000 })
    await page.addStyleTag({ content: 'html, body { background: transparent !important }' })
    await page.waitForTimeout(300)
    const png = await page.locator('canvas').screenshot({ omitBackground: true })
    const file = path.join(OUT, `${c.slug}.webp`)
    const info = await sharp(png).resize(W, H).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(file)
    files.push(file)
    // opaque copy on paper for og:image / JSON-LD (link previews render transparency black)
    await sharp(png).resize(W, H).flatten({ background: '#F6F4EF' }).jpeg({ quality: 84, mozjpeg: true }).toFile(file.replace(/\.webp$/, '.jpg'))
    console.log(`${c.slug}.webp  ${(info.size / 1024).toFixed(0)} kB`)
  }

  // Open Graph collage: 4 × 2 tiles on paper, 1200 × 630
  const tw = 300
  const th = 225
  const tiles = await Promise.all(files.map((f) => sharp(f).resize(tw, th).toBuffer()))
  const head = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="90">
    <svg x="36" y="27" width="60" height="38" viewBox="${MARK.viewBox}"><path fill="${MARK.ink}" d="${MARK.d}"/><circle fill="${MARK.dot.fill}" cx="${MARK.dot.cx}" cy="${MARK.dot.cy}" r="${MARK.dot.r}"/></svg>
    <text x="112" y="56" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="800" fill="#1E1F21">SHREE ASHAPURA INDUSTRIES</text>
    <text x="1160" y="56" text-anchor="end" font-family="Menlo, monospace" font-size="15" letter-spacing="1.5" fill="#55575A">FASTENERS · TURNED PARTS · FURNITURE FITTINGS · MUMBAI</text>
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
