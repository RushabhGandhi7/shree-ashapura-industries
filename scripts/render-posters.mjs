// Renders the placeholder images for the hero and the configurator from the live 3D scenes,
// so the swap from poster to live canvas is a pure opacity crossfade (same subject, same
// framing, same materials). Starts the Vite dev server, opens each page in Chromium at 2×
// device pixels, hides everything but the canvas, and captures exactly the rect the camera
// fits the subject into (window.__heroFit / window.__customFit, set by the scenes in dev).
//   node scripts/render-posters.mjs
// Writes public/posters/hero.webp (rest pose), hero-seated.webp (reduced motion: seated
// pose) and custom.webp (the configurator's default part). Transparent backgrounds.
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public/posters')
const PORT = 5181

async function startServer() {
  const proc = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'pipe' })
  const url = `http://localhost:${PORT}`
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return { url, stop: () => proc.kill() }
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  proc.kill()
  throw new Error('Vite dev server did not start')
}

const HIDE = `
  html, body { background: transparent !important; }
  body * { visibility: hidden !important; transition: none !important; }
  canvas { visibility: visible !important; opacity: 1 !important; }
`

// grow: capture this much more than the fitted rect around its centre (shadows reach past
// it); the page scales the contain-fitted image up by the same factor (Hero.jsx POSTER.grow).
async function capture(browser, { url, name, canvas, fit, reduced, scrollTo, grow = 1, viewport = { width: 1440, height: 900 } }) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, reducedMotion: reduced ? 'reduce' : 'no-preference' })
  await ctx.addInitScript(() => sessionStorage.setItem('sa-intro-seen', '1'))
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.error('page error:', e.message))
  await page.goto(url)
  if (scrollTo) {
    await page.waitForSelector(scrollTo)
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), scrollTo)
  }
  await page.waitForFunction((k) => !!window[k], fit, { timeout: 30000 })
  await page.waitForTimeout(2500) // environment, materials and the damped camera fit settle
  const rect = await page.evaluate(
    ({ canvas, fit, grow }) => {
      const c = document.querySelector(canvas).getBoundingClientRect()
      const f = window[fit]
      const w = f.w * grow
      const h = f.h * grow
      return { x: c.left + f.cx - w / 2, y: c.top + f.cy - h / 2, width: w, height: h }
    },
    { canvas, fit, grow },
  )
  await page.addStyleTag({ content: HIDE })
  await page.waitForTimeout(200)
  const png = await page.screenshot({ clip: rect, omitBackground: true })
  const file = path.join(OUT, `${name}.webp`)
  const info = await sharp(png).webp({ quality: 85, alphaQuality: 90, effort: 6 }).toFile(file)
  console.log(`${name}.webp  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} kB`)
  await ctx.close()
}

const server = await startServer()
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
await mkdir(OUT, { recursive: true })
try {
  const hero = { canvas: '#top canvas', fit: '__heroFit', grow: 1.2, viewport: { width: 1920, height: 1080 } } // 2× the largest common hero box
  await capture(browser, { url: `${server.url}/`, name: 'hero', ...hero })
  await capture(browser, { url: `${server.url}/`, name: 'hero-seated', ...hero, reduced: true })
  await capture(browser, { url: `${server.url}/custom`, name: 'custom', canvas: '#customise canvas', fit: '__customFit', reduced: true, scrollTo: '#customise canvas, #customise' })
} finally {
  await browser.close()
  server.stop()
}
