// Prerender every route to static HTML after `vite build`, so crawlers and link previews
// (WhatsApp, LinkedIn) get real content and per-page head tags.
//
// A real browser renders the built SPA (prefers-reduced-motion, WebGL disabled, so no
// canvas or pinned layout is captured and the 3D stays client-only). For each route we
// keep the head tags React rendered ([data-seo]) and the #root markup, and write
//   dist/index.html, dist/products.html, dist/products/<slug>.html, ..., dist/404.html
// (Vercel cleanUrls serves /products from products.html). On load, main.jsx removes the
// prerendered head tags and React renders over the markup (no hydration).
//
// Browser: Playwright's Chromium locally; on Vercel (process.env.VERCEL) @sparticuz/chromium.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { serveDist } from './serve-dist.mjs'
import { loaderFrameHTML } from './static-shell.js'

const DIST = path.resolve('dist')
const { pages, notFoundPage } = await import(pathToFileURL(path.resolve('src/routes.js')).href)
const routes = [...pages.map((p) => p.path), notFoundPage.path]

async function launch() {
  if (process.env.VERCEL || process.env.PRERENDER_SPARTICUZ) {
    const { default: chromium } = await import('@sparticuz/chromium')
    const { chromium: pw } = await import('playwright-core')
    return pw.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: true })
  }
  const { chromium } = await import('playwright')
  try {
    return await chromium.launch()
  } catch {
    return await chromium.launch({ channel: 'chrome' })
  }
}

// first-paint poster of routes whose LCP is a 3D placeholder
const PRELOAD = { '/': '/posters/hero.webp', '/custom': '/posters/custom.webp' }
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
if (!template.includes('<div id="root"></div>')) throw new Error('dist/index.html is already prerendered: run `npm run build` (vite build first).')
fs.writeFileSync(path.join(DIST, '__spa.html'), template)
const server = await serveDist({ root: DIST, port: 4179, spaFallback: true })
const browser = await launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
await ctx.addInitScript(() => {
  try {
    sessionStorage.setItem('sa-intro-seen', '1')
  } catch {}
  window.__prerender = true
  const get = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    return /webgl/.test(type) ? null : get.call(this, type, ...rest)
  }
})

const loader = await loaderFrameHTML()
const out = []
try {
  for (const route of routes) {
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto(server.url + route, { waitUntil: 'networkidle' })
    await page.waitForFunction((r) => window.__pageReady === r, route, { timeout: 30000 })
    await page.waitForTimeout(150)
    const { head, body } = await page.evaluate(() => {
      const root = document.getElementById('root').cloneNode(true)
      root.querySelectorAll('canvas, [data-transient], script:not([type="application/ld+json"])').forEach((n) => n.remove())
      return {
        head: [...document.head.querySelectorAll('[data-seo]')].map((n) => n.outerHTML).join('\n    '),
        body: root.innerHTML,
      }
    })
    if (errors.length) throw new Error(`${route}: ${errors.join('; ')}`)
    const shell = `<div id="sa-shell">${route === '/' ? loader : ''}${body}</div>`
    const html = template
      .replace(/<title data-seo[^>]*>[\s\S]*?<\/title>/, '')
      .replace(/<meta data-seo[^>]*>/, '')
      .replace('</head>', `  ${PRELOAD[route] ? `<link rel="preload" as="image" href="${PRELOAD[route]}" fetchpriority="high">\n    ` : ''}${head}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${shell}</div>`)
    const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`
    out.push([file, html])
    await page.close()
    console.log(`prerendered ${route.padEnd(34)} ${(html.length / 1024).toFixed(0)} kB`)
  }
} finally {
  await browser.close()
  server.close()
}
for (const [file, html] of out) {
  fs.mkdirSync(path.dirname(path.join(DIST, file)), { recursive: true })
  fs.writeFileSync(path.join(DIST, file), html)
}
fs.rmSync(path.join(DIST, '__spa.html'))
console.log(`${out.length} pages written`)
