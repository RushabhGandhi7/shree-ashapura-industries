// Dev check for Phase 8C: drift between product card slots and their drei Views.
//   node scripts/check-view-drift.mjs <outDir> [tag] [baseUrl]   (needs: npx playwright install webkit chromium)

// Measures drift between each product card's 3D slot and where its drei View is drawn.
// Drawn box = WebGL scissor box at draw time (buffer px, y from bottom) mapped to CSS px.
import { createRequire } from 'node:module'
const { webkit, chromium } = createRequire(process.cwd() + '/package.json')('playwright')
const SP = process.argv[2]
const tag = process.argv[3] || 'before'
const BASE = process.argv[4] || 'http://localhost:5173'
const init = () => {
  sessionStorage.setItem('sa-intro-seen', '1')
  window.__drift = []
  const patch = (proto) => {
    const sc = proto.scissor
    let pending = null
    proto.scissor = function (x, y, w, h) {
      const cv = this.canvas
      pending = cv && cv.closest && cv.closest('#products') && w > 20 && !(w === cv.width && h === cv.height) ? { cv, x, y, w, h } : null
      return sc.call(this, x, y, w, h)
    }
    const log = function () {
      if (!pending) return
      const { cv, x, y, w, h } = pending
      pending = null // one sample per drawn view box
      const r = cv.getBoundingClientRect()
      const kx = cv.width / r.width
      const ky = cv.height / r.height // the buffer is floored per axis, so convert each axis separately
      const drawn = { left: r.left + x / kx, top: r.top + (cv.height - y - h) / ky, w: w / kx, h: h / ky }
      const slots = [...document.querySelectorAll('#products ul li a > div.relative')].map((s) => s.getBoundingClientRect())
      let best = null
      for (const s of slots) {
        const dx = Math.abs(s.left - drawn.left) + Math.abs(s.width - drawn.w)
        if (dx < 4 && (!best || Math.abs(s.top - drawn.top) < Math.abs(best.top - drawn.top))) best = s
      }
      if (best) window.__drift.push({ t: performance.now(), dy: drawn.top - best.top, dx: drawn.left - best.left, y: scrollY })
    }
    for (const fn of ['drawElements', 'drawArrays']) {
      const orig = proto[fn]
      proto[fn] = function (...a) {
        log()
        return orig.apply(this, a)
      }
    }
  }
  patch(WebGLRenderingContext.prototype)
  if (window.WebGL2RenderingContext) patch(WebGL2RenderingContext.prototype)
}
const out = {}
for (const [name, bt] of [['webkit', webkit], ['chromium', chromium]]) {
  const browser = await bt.launch()
  for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } })
    await page.addInitScript(init)
    await page.goto(BASE + '/products')
    await page.waitForTimeout(3500)
    // force a render every frame (what a hover spin or a resize does in real use)
    await page.evaluate(() => {
      const loop = () => (window.dispatchEvent(new Event('resize')), (window.__forceRaf = requestAnimationFrame(loop)))
      loop()
    })
    await page.mouse.move(w / 2, h / 2)
    await page.evaluate(() => (window.__drift = []))
    // momentum-style wheel scroll down through the grid, screenshot mid-scroll
    for (let i = 0; i < 14; i++) {
      await page.mouse.wheel(0, 120)
      await page.waitForTimeout(16)
      if (i === 9) await page.screenshot({ path: `${SP}/8c/${tag}-${name}-${w}-mid.png` })
    }
    await page.waitForTimeout(120)
    const mid = await page.evaluate(() => window.__drift.splice(0))
    await page.waitForTimeout(1500)
    await page.evaluate(() => (window.__drift = []))
    await page.waitForTimeout(400)
    const settled = await page.evaluate(() => window.__drift.splice(0))
    await page.screenshot({ path: `${SP}/8c/${tag}-${name}-${w}-settled.png` })
    const stat = (a) => (a.length ? { n: a.length, maxAbsDy: +Math.max(...a.map((d) => Math.abs(d.dy))).toFixed(1), maxAbsDx: +Math.max(...a.map((d) => Math.abs(d.dx))).toFixed(1) } : { n: 0 })
    out[`${name} ${w}`] = { mid: stat(mid), settled: stat(settled) }
    await page.close()
  }
  await browser.close()
}
console.log(JSON.stringify(out, null, 1))
